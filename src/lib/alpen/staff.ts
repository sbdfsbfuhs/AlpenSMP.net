import { SITE } from "@/lib/alpen/site";
import { STAFF_GATE, STAFF_OWNER } from "@/lib/alpen/gate";

const ROOT = SITE.fb;

export type StaffSession = {
  username: string;
  role: "owner" | "admin" | "helper" | string;
  mustChangePw: boolean;
};

export type ModItem = {
  name?: string;
  reason?: string;
  duration?: string;
  endsAt?: number | null;
  by?: string;
  ts?: number;
  text?: string;
  archived?: boolean;
  archiveReason?: string;
  archivedBy?: string;
  archivedAt?: number;
  msg?: string;
  replies?: Record<string, { by?: string; text?: string; ts?: number }>;
  ticketCode?: string;
  status?: string;
};

export type CommandItem = {
  name?: string;
  desc?: string;
  category?: string;
  by?: string;
  ts?: number;
};

export type CommunityItem = {
  name?: string;
  text?: string;
  caption?: string;
  rating?: number;
  status?: string;
  ts?: number;
  imageUrl?: string;
};

type MapOf<T> = Record<string, T>;

async function request(path: string, method: string, body?: unknown) {
  const res = await fetch(`${ROOT}/${path}.json`, {
    method,
    headers: body === undefined ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Speichern fehlgeschlagen");
  if (res.status === 204) return null;
  return res.json();
}

export function fbGet<T>(path: string): Promise<T | null> {
  return request(path, "GET") as Promise<T | null>;
}

export function fbUpdate(path: string, body: unknown) {
  return request(path, "PATCH", body);
}

export function fbSet(path: string, body: unknown) {
  return request(path, "PUT", body);
}

export function fbPush(path: string, body: unknown) {
  return request(path, "POST", body) as Promise<{ name?: string } | null>;
}

export function fbRemove(path: string) {
  return request(path, "DELETE");
}

export function entries<T>(value: MapOf<T> | null | undefined): [string, T][] {
  return Object.entries(value ?? {}).reverse();
}

export function parseDuration(str: string): number | null {
  if (!str || /permanent|perm|∞/i.test(str)) return null;
  const s = str.toLowerCase().trim();
  let ms = 0;
  const d = s.match(/(\d+)\s*(tage?|days?|d)/);
  if (d) ms += parseInt(d[1], 10) * 864e5;
  const h = s.match(/(\d+)\s*(stunden?|hours?|h)/);
  if (h) ms += parseInt(h[1], 10) * 36e5;
  const m = s.match(/(\d+)\s*(minuten?|mins?|m)/);
  if (m) ms += parseInt(m[1], 10) * 6e4;
  const sec = s.match(/(\d+)\s*(sekunden?|secs?|s)/);
  if (sec) ms += parseInt(sec[1], 10) * 1e3;
  if (!ms) {
    const n = parseInt(s, 10);
    if (!Number.isNaN(n)) ms = n * 6e4;
  }
  return ms > 0 ? Date.now() + ms : null;
}

export function formatRemaining(endsAt?: number | null) {
  if (!endsAt) return "Permanent";
  const diff = endsAt - Date.now();
  if (diff <= 0) return "abgelaufen";
  const d = Math.floor(diff / 864e5);
  const h = Math.floor((diff % 864e5) / 36e5);
  const m = Math.floor((diff % 36e5) / 6e4);
  if (d > 0) return `${d}T ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export function formatWhen(ts?: number) {
  if (!ts) return "";
  return new Date(ts).toLocaleString("de-CH", { dateStyle: "short", timeStyle: "short" });
}

const SESSION = "alpen-staff-session";

export function readSession(): StaffSession | null {
  try {
    const raw = sessionStorage.getItem(SESSION);
    return raw ? (JSON.parse(raw) as StaffSession) : null;
  } catch {
    return null;
  }
}

export function writeSession(user: StaffSession | null) {
  if (!user) sessionStorage.removeItem(SESSION);
  else sessionStorage.setItem(SESSION, JSON.stringify(user));
}

export async function loginStaff(username: string, password: string): Promise<StaffSession> {
  const user = username.trim().toLowerCase();
  if (!user || !password) throw new Error("Name und Passwort");
  if (user === STAFF_OWNER && password === STAFF_GATE) {
    return { username: user, role: "owner", mustChangePw: false };
  }
  const row = await fbGet<{ password?: string; role?: string; mustChangePw?: boolean; ownerUntil?: number | null }>(
    `staffUsers/${encodeURIComponent(user)}`,
  );
  if (!row || row.password !== password) throw new Error("Zugang ungültig");
  if (row.ownerUntil && row.ownerUntil <= Date.now() && row.role === "owner") {
    throw new Error("Owner-Zeit abgelaufen");
  }
  return { username: user, role: row.role || "helper", mustChangePw: Boolean(row.mustChangePw) };
}

export async function loadCommands(): Promise<[string, CommandItem][]> {
  const data = await fbGet<MapOf<CommandItem>>("commands");
  return entries(data).sort((a, b) => (b[1].ts || 0) - (a[1].ts || 0));
}
