import { useEffect, useState } from "react";
import { isMoved } from "@/lib/alpen/security";
import { normalizeTicketCode } from "@/lib/alpen/ticket-access";
import { fbGet, fbRemove, fbUpdate, type StaffSession } from "@/lib/alpen/staff";

const liveFailurePaths = new Set<string>();

function liveErrorCode(path: string) {
  const slug = path.toUpperCase().replace(/[^A-Z0-9]+/g, "-").replace(/^-|-$/g, "");
  return `LIVE-${slug || "DATA"}-001`;
}

export function useLive<T>(path: string, enabled = true) {
  const [data, setData] = useState<Record<string, T>>({});
  useEffect(() => {
    if (!enabled) {
      setData({});
      return;
    }
    let stop = false;
    const wait = isMoved(path) ? 8000 : 30000;
    const pull = () => {
      if (document.hidden) return;
      fbGet<Record<string, T>>(path)
        .then((value) => {
          if (stop) return;
          setData(value ?? {});
          if (liveFailurePaths.delete(path)) {
            window.dispatchEvent(new CustomEvent("staff-live:resolved", { detail: { code: liveErrorCode(path) } }));
          }
        })
        .catch((error: unknown) => {
          if (stop || liveFailurePaths.has(path)) return;
          liveFailurePaths.add(path);
          const code = liveErrorCode(path);
          console.error(`[Staff Center] ${code}: ${path} konnte nicht geladen werden.`, error);
          window.dispatchEvent(new CustomEvent("staff-live:error", {
            detail: {
              code,
              message: error instanceof Error ? error.message : "Unbekannter Fehler",
            },
          }));
        });
    };
    pull();
    const id = window.setInterval(pull, wait);
    const onShow = () => {
      if (!document.hidden) pull();
    };
    document.addEventListener("visibilitychange", onShow);
    return () => {
      stop = true;
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onShow);
    };
  }, [path, enabled]);
  return data;
}

export async function archive(path: string, key: string, user: StaffSession, note: (text: string) => void) {
  const reason = window.prompt("Begründung") || "";
  if (user.role !== "owner" && reason.trim().length < 3) return note("Begründung Pflicht");
  try {
    await fbUpdate(`${path}/${key}`, {
      archived: true,
      archivedBy: user.username,
      archivedAt: Date.now(),
      archiveReason: reason || "Owner",
      updatedAt: Date.now(),
    });
    note("Im Archiv");
  } catch (err) {
    note(err instanceof Error ? err.message : "Archivieren fehlgeschlagen");
  }
}

export async function wipe(
  path: string,
  key: string,
  note: (text: string) => void,
  ticketCode?: string | null,
): Promise<boolean> {
  const normalizedTicketCode = path === "helpRequests" && ticketCode
    ? normalizeTicketCode(ticketCode)
    : null;
  if (path === "helpRequests" && ticketCode && !normalizedTicketCode) {
    note("Ungültige Ticketnummer; die Anfrage wurde nicht gelöscht.");
    return false;
  }
  const confirmation = path === "helpRequests"
    ? `Support-Anfrage${normalizedTicketCode ? ` ${normalizedTicketCode}` : ""} endgültig löschen?${normalizedTicketCode ? " Der Spieler kann das Ticket danach nicht mehr abrufen." : ""} Diese Aktion kann nicht rückgängig gemacht werden.`
    : "Endgültig löschen?";
  if (!window.confirm(confirmation)) return false;
  let ticketAccessDeleted = false;
  try {
    if (normalizedTicketCode) {
      await fbRemove(`tickets/${encodeURIComponent(normalizedTicketCode)}`);
      ticketAccessDeleted = true;
    }
    await fbRemove(`${path}/${key}`);
    note(path !== "helpRequests"
      ? "Gelöscht"
      : normalizedTicketCode
        ? "Support-Anfrage und Ticketzugriff endgültig gelöscht."
        : "Support-Anfrage endgültig gelöscht.");
    return true;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Löschen fehlgeschlagen";
    note(ticketAccessDeleted
      ? `Der Spielerzugriff wurde widerrufen, aber die Support-Anfrage konnte nicht gelöscht werden: ${message}`
      : message);
    return false;
  }
}
