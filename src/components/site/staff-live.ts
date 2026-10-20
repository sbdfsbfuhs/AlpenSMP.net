import { useEffect, useState } from "react";
import { ensureIdToken } from "@/lib/alpen/fb-auth";
import { SITE } from "@/lib/alpen/site";
import { fbGet, fbRemove, fbUpdate, type StaffSession } from "@/lib/alpen/staff";

export function shallowCount(path: string) {
  return ensureIdToken()
    .then((token) => {
      const url = new URL(`${SITE.fb}/${path}.json`);
      url.searchParams.set("shallow", "true");
      if (token) url.searchParams.set("auth", token);
      return fetch(url);
    })
    .then((res) => (res.ok ? res.json() : null))
    .then((data: Record<string, unknown> | null) => (data && typeof data === "object" ? Object.keys(data).length : 0))
    .catch(() => 0);
}

export function useLive<T>(path: string) {
  const [data, setData] = useState<Record<string, T>>({});
  useEffect(() => {
    let stop = false;
    const pull = () => {
      fbGet<Record<string, T>>(path)
        .then((value) => {
          if (!stop) setData(value ?? {});
        })
        .catch(() => {});
    };
    pull();
    const id = window.setInterval(pull, 30000);
    return () => {
      stop = true;
      window.clearInterval(id);
    };
  }, [path]);
  return data;
}

export async function archive(path: string, key: string, user: StaffSession, note: (text: string) => void) {
  const reason = window.prompt("Begründung") || "";
  if (user.role !== "owner" && reason.trim().length < 3) return note("Begründung Pflicht");
  await fbUpdate(`${path}/${key}`, { archived: true, archivedBy: user.username, archivedAt: Date.now(), archiveReason: reason || "Owner" });
  note("Im Archiv");
}

export async function wipe(path: string, key: string, note: (text: string) => void) {
  if (!window.confirm("Endgültig löschen?")) return;
  await fbRemove(`${path}/${key}`);
  note("Gelöscht");
}
