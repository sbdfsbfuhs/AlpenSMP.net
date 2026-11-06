import { ensureIdToken } from "@/lib/alpen/fb-auth";
import { SITE } from "@/lib/alpen/site";

const BASE = "https://panel.alpensmp.net/alpen-sicherheit";

const MOVED = new Set([
  "bans",
  "warns",
  "notes",
  "helpRequests",
  "tickets",
  "commands",
  "playerCommands",
  "banGuide",
  "tasks",
  "absences",
  "guideTopics",
  "rulesPublic",
  "rulesStaff",
  "site_copy",
  "mascotSettings",
  "changelog",
  "live_streams",
  "community_reviews",
  "community_images",
  "season",
  "site_settings",
]);

export class SecurityDown extends Error {}
export class SecurityDenied extends Error {}

export function isMoved(path: string) {
  return MOVED.has(path.split("/").filter(Boolean)[0] || "");
}

export async function securityJson<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = await ensureIdToken();
  if (!token) throw new SecurityDenied("keine Anmeldung");
  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(init.body ? { "Content-Type": "application/json" } : {}),
        ...init.headers,
      },
      signal: AbortSignal.timeout(4000),
    });
  } catch {
    throw new SecurityDown("nicht erreichbar");
  }
  if (res.status === 401 || res.status === 403) throw new SecurityDenied(String(res.status));
  if (!res.ok) throw new SecurityDown(String(res.status));
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export async function relay(path: string, method: string, body?: unknown): Promise<{ handled: boolean; data: unknown }> {
  const result = await relayDetail(path, method, body);
  return { handled: result.ok, data: result.data };
}

export async function relayDetail(path: string, method: string, body?: unknown): Promise<{ ok: boolean; status: number; error: string; data: unknown }> {
  if (!isMoved(path)) return { ok: false, status: 0, error: "nicht vorgesehen", data: null };
  const token = await ensureIdToken().catch(() => null);
  const send = async (auth: string | null) => {
    const headers: Record<string, string> = {};
    if (auth) headers.Authorization = `Bearer ${auth}`;
    if (body !== undefined) headers["Content-Type"] = "application/json";
    return fetch(`${BASE}/api/data/${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(12000),
    });
  };
  try {
    let res = await send(token);
    if (token && res.status === 401 && method === "GET") res = await send(null);
    if (res.status === 204) return { ok: true, status: 204, error: "", data: null };
    const text = await res.text();
    if (!res.ok) return { ok: false, status: res.status, error: text.slice(0, 180) || "Speichern abgelehnt", data: null };
    try {
      return { ok: true, status: res.status, error: "", data: text ? JSON.parse(text) : null };
    } catch {
      return { ok: true, status: res.status, error: "", data: null };
    }
  } catch (err) {
    return { ok: false, status: 0, error: err instanceof Error ? err.message : "nicht erreichbar", data: null };
  }
}

async function firebaseGet(path: string) {
  const token = await ensureIdToken().catch(() => null);
  const url = new URL(`${SITE.fb}/${path}.json`);
  if (token) url.searchParams.set("auth", token);
  const res = await fetch(url);
  if (!res.ok) throw new Error(String(res.status));
  return res.json();
}

export async function loadPath(path: string) {
  if (isMoved(path)) {
    const moved = await relayDetail(path, "GET");
    if (moved.ok) return moved.data;
    if (moved.status === 404) return null;
    if (moved.status !== 0 && moved.status < 500) throw new Error("Laden fehlgeschlagen");
  }
  try {
    return await firebaseGet(path);
  } catch {
    throw new Error("Laden fehlgeschlagen");
  }
}
