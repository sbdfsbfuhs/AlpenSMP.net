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

function mergeValue(base: unknown, over: unknown): unknown {
  if (over == null) return base ?? null;
  if (base == null || typeof base !== "object" || typeof over !== "object" || Array.isArray(base) || Array.isArray(over)) return over;
  const out: Record<string, unknown> = { ...(base as Record<string, unknown>) };
  for (const [key, value] of Object.entries(over as Record<string, unknown>)) out[key] = mergeValue(out[key], value);
  return out;
}

export async function relay(path: string, method: string, body?: unknown): Promise<{ handled: boolean; data: unknown }> {
  const result = await relayDetail(path, method, body);
  return { handled: result.ok, data: result.data };
}

export async function relayDetail(path: string, method: string, body?: unknown): Promise<{ ok: boolean; status: number; error: string; data: unknown }> {
  if (!isMoved(path)) return { ok: false, status: 0, error: "nicht vorgesehen", data: null };
  const token = await ensureIdToken().catch(() => null);
  if (!token) return { ok: false, status: 401, error: "kein Token im Browser", data: null };
  try {
    const res = await fetch(`${BASE}/api/data/${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(12000),
    });
    if (res.status === 204) return { ok: true, status: 204, error: "", data: null };
    const text = await res.text();
    if (!res.ok) return { ok: false, status: res.status, error: text.slice(0, 140), data: null };
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
  const [fb, moved] = await Promise.all([
    firebaseGet(path).then((data) => ({ ok: true as const, data })).catch(() => ({ ok: false as const, data: null })),
    isMoved(path) ? relay(path, "GET") : Promise.resolve({ handled: false, data: null }),
  ]);
  if (moved.handled) {
    if (!fb.ok || fb.data == null) return moved.data;
    return mergeValue(fb.data, moved.data);
  }
  if (!fb.ok) throw new Error("Laden fehlgeschlagen");
  return fb.data;
}
