import { useEffect, useState } from "react";
import { isMoved } from "@/lib/alpen/security";
import { fbGet, fbRemove, fbUpdate, type StaffSession } from "@/lib/alpen/staff";

const liveFailurePaths = new Set<string>();

function liveErrorCode(path: string) {
  const slug = path.toUpperCase().replace(/[^A-Z0-9]+/g, "-").replace(/^-|-$/g, "");
  return `LIVE-${slug || "DATA"}-001`;
}

export function useLive<T>(path: string) {
  const [data, setData] = useState<Record<string, T>>({});
  useEffect(() => {
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
  }, [path]);
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

export async function wipe(path: string, key: string, note: (text: string) => void) {
  if (!window.confirm("Endgültig löschen?")) return;
  try {
    await fbRemove(`${path}/${key}`);
    note("Gelöscht");
  } catch (err) {
    note(err instanceof Error ? err.message : "Löschen fehlgeschlagen");
  }
}
