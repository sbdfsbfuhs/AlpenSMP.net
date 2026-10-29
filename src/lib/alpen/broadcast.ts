import { useEffect, useState } from "react";
import { SITE } from "@/lib/alpen/site";
import { isMoved, loadPath } from "@/lib/alpen/security";

export type NewsCategory = "Update" | "Regel" | "Command" | "Event" | "Wartung" | "Neu";

export type NewsItem = {
  id?: string;
  title?: string;
  description?: string;
  category?: NewsCategory | string;
  date?: number;
  url?: string;
  published?: boolean;
  by?: string;
};

export type ServerStatus = {
  type?: string;
  status_type?: string;
  title?: string;
  message?: string;
  is_active?: boolean;
  lockdown?: boolean;
  expires_at?: number | null;
  created_by?: string;
  updated_at?: number;
  updated_by?: string;
  color?: string;
  button_label?: string;
  button_href?: string;
};

export type LiveStream = {
  streamer_name?: string;
  platform?: string;
  title?: string;
  url?: string;
  started_at?: number;
  ends_at?: number | null;
  is_live?: boolean;
  created_by?: string;
  uid?: string;
};

const ROOT = SITE.fb;

function setAt(root: unknown, path: string, data: unknown): unknown {
  if (path === "/" || path === "") return data;
  const parts = path.split("/").filter(Boolean);
  const clone: Record<string, unknown> =
    root && typeof root === "object" ? { ...(root as Record<string, unknown>) } : {};
  let cursor = clone;
  for (let i = 0; i < parts.length - 1; i++) {
    const key = parts[i]!;
    const next = cursor[key];
    cursor[key] = next && typeof next === "object" ? { ...(next as Record<string, unknown>) } : {};
    cursor = cursor[key] as Record<string, unknown>;
  }
  const last = parts[parts.length - 1]!;
  if (data === null) delete cursor[last];
  else cursor[last] = data;
  return clone;
}

export function fbListen(path: string, onValue: (data: unknown) => void) {
  let root: unknown = null;
  let closed = false;
  const url = `${ROOT}/${path}.json`;
  const apply = (kind: "put" | "patch", raw: string) => {
    const body = JSON.parse(raw) as { path?: string; data?: unknown };
    const at = body.path || "/";
    if (kind === "patch" && body.data && typeof body.data === "object") {
      for (const [key, value] of Object.entries(body.data as Record<string, unknown>)) {
        root = setAt(root, `${at === "/" ? "" : at}/${key}`, value);
      }
    } else {
      root = setAt(root, at, body.data ?? null);
    }
    onValue(root);
  };
  const pull = () => {
    const job = isMoved(path) ? loadPath(path) : fetch(url).then((res) => res.json());
    job
      .then((data) => {
        if (closed || (data && typeof data === "object" && "error" in data)) return;
        root = data;
        onValue(data);
      })
      .catch(() => {});
  };
  pull();
  let source: EventSource | null = null;
  if (!isMoved(path)) {
    try {
      source = new EventSource(url);
      source.addEventListener("put", (event) => apply("put", (event as MessageEvent).data));
      source.addEventListener("patch", (event) => apply("patch", (event as MessageEvent).data));
    } catch {
      source = null;
    }
  }
  const poll = window.setInterval(
    () => {
      if (document.hidden) return;
      pull();
    },
    isMoved(path) ? 20000 : 3 * 60 * 1000,
  );
  return () => {
    closed = true;
    source?.close();
    window.clearInterval(poll);
  };
}

export function useFbValue<T>(path: string) {
  const [value, setValue] = useState<T | null>(null);
  useEffect(() => fbListen(path, (data) => setValue((data as T) ?? null)), [path]);
  return value;
}

export function countdown(until?: number | null) {
  if (!until) return "";
  const diff = until - Date.now();
  if (diff <= 0) return "";
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  if (h > 0) return `noch ${h}h ${m}min`;
  return `noch ${Math.max(1, m)} Min`;
}
