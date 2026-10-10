import { SITE } from "@/lib/alpen/site";
import { changeOwnPassword, clearFirebaseLogin, createFirebaseUser, ensureIdToken, signInEmail } from "@/lib/alpen/fb-auth";

const ROOT = SITE.fb;

export type StaffSession = {
  username: string;
  role: "owner" | "admin" | "helper" | string;
  mustChangePw: boolean;
  email: string;
  uid: string;
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
  updatedAt?: number;
  proof?: string;
  pending?: boolean;
  confirmedBy?: string;
  confirmedAt?: number;
  doneBy?: string;
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
  updatedAt?: number;
  imageUrl?: string;
};

type MapOf<T> = Record<string, T>;

async function request(path: string, method: string, body?: unknown) {
  const token = await ensureIdToken();
  const url = new URL(`${ROOT}/${path}.json`);
  if (token) url.searchParams.set("auth", token);
  const res = await fetch(url, {
    method,
    headers: body === undefined ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!res.ok) {
    if (res.status === 401 || res.status === 403) throw new Error("Die Datenbank lässt das noch nicht zu. Regeln prüfen.");
    throw new Error("Speichern fehlgeschlagen");
  }
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

export function isPermanentBan(item: { duration?: string; endsAt?: number | null }) {
  if (item.endsAt) return false;
  const duration = (item.duration || "").toLowerCase();
  return duration.includes("perm") || duration.includes("∞");
}

export function permLeft(ts?: number) {
  if (!ts) return "Archiviert in 24h";
  const left = ts + 86_400_000 - Date.now();
  if (left <= 0) return "wird archiviert";
  const h = Math.floor(left / 36e5);
  const m = Math.floor((left % 36e5) / 6e4);
  return `Archiviert in ${h}h ${m}min`;
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
  if (!user) {
    sessionStorage.removeItem(SESSION);
    clearFirebaseLogin();
  } else sessionStorage.setItem(SESSION, JSON.stringify(user));
}

const NAME = /^[a-z0-9._-]{2,24}$/;
const STAFF_MAIL = "@staff.alpensmp.net";

export function staffName(value: string) {
  const name = value.trim().toLowerCase().replace(/\s+/g, "");
  if (!NAME.test(name)) throw new Error("Name: 2–24 Zeichen, nur Buchstaben, Zahlen, . _ -");
  return name;
}

export function freshStamp(ts?: number, updatedAt?: number) {
  const day = 86_400_000;
  const now = Date.now();
  return (typeof ts === "number" && now - ts < day) || (typeof updatedAt === "number" && now - updatedAt < day);
}

export function staffLoginId(value: string) {
  const raw = value.trim().toLowerCase();
  if (!raw) throw new Error("Name und Passwort");
  if (raw.includes("@")) return raw;
  return `${staffName(raw)}${STAFF_MAIL}`;
}

export async function savePassword(username: string, password: string) {
  if (!password) throw new Error("Passwort fehlt");
  const name = staffName(username);
  await changeOwnPassword(password);
  await fbUpdate(`staffUsers/${name}`, { mustChangePw: false });
}

export async function createStaffAccount(input: { username: string; password: string; role: string; createdBy: string }) {
  if (!input.password) throw new Error("Passwort fehlt");
  if (input.password.length < 6) throw new Error("Firebase lässt unter 6 Zeichen nicht zu. Kürzer geht nicht.");
  const name = staffName(input.username);
  const email = `${name}${STAFF_MAIL}`;
  const existing = await fbGet<{ uid?: string }>(`staffUsers/${name}`);
  if (existing?.uid) throw new Error("Existiert schon");
  const created = await createFirebaseUser(email, input.password);
  await fbSet(`staffByUid/${created.uid}`, { username: name, email, role: input.role, disabled: false });
  await fbSet(`staffUsers/${name}`, {
    role: input.role,
    email,
    uid: created.uid,
    mustChangePw: true,
    disabled: false,
    createdAt: Date.now(),
    createdBy: input.createdBy,
  });
  try {
    await fbSet(`staffGate/${name}`, { email });
  } catch {
    /* Erste Anmeldung nutzt den Namen, bis die Gate-Regel da ist. */
  }
  await logStaff(input.createdBy, "Account angelegt", `${name} · ${input.role}`);
}

export async function logStaff(by: string, action: string, detail = "") {
  try {
    await fbPush("staffLog", { by, action, detail: detail.slice(0, 180), ts: Date.now() });
  } catch {
    /* Aktivitätslog ist optional, bis die Regel veröffentlicht ist. */
  }
}

export async function setStaffRole(username: string, role: string, actor: string) {
  const name = staffName(username);
  const row = await fbGet<{ uid?: string }>(`staffUsers/${name}`);
  await fbUpdate(`staffUsers/${name}`, { role });
  if (row?.uid) await fbUpdate(`staffByUid/${row.uid}`, { role });
  await logStaff(actor, "Rolle geändert", `${name} · ${role}`);
}

export async function setStaffPaused(username: string, paused: boolean, actor: string) {
  const name = staffName(username);
  const row = await fbGet<{ uid?: string }>(`staffUsers/${name}`);
  await fbUpdate(`staffUsers/${name}`, { disabled: paused });
  if (row?.uid) await fbUpdate(`staffByUid/${row.uid}`, { disabled: paused });
  await logStaff(actor, paused ? "Account pausiert" : "Account freigegeben", name);
}

export async function resetStaffPassword(username: string, password: string, actor: string) {
  if (!password) throw new Error("Passwort fehlt");
  const name = staffName(username);
  const row = await fbGet<{ uid?: string; role?: string; disabled?: boolean }>(`staffUsers/${name}`);
  if (!row?.uid) throw new Error("Account fehlt");
  const email = `${name}.r${Date.now().toString(36)}${STAFF_MAIL}`;
  const created = await createFirebaseUser(email, password);
  await fbSet(`staffByUid/${created.uid}`, { username: name, email, role: row.role || "helper", disabled: Boolean(row.disabled) });
  await fbUpdate(`staffByUid/${row.uid}`, { disabled: true, replacedBy: created.uid });
  await fbUpdate(`staffUsers/${name}`, { email, uid: created.uid, mustChangePw: true });
  try {
    await fbSet(`staffGate/${name}`, { email });
  } catch {
    await fbUpdate(`staffByUid/${row.uid}`, { disabled: Boolean(row.disabled), replacedBy: null });
    await fbRemove(`staffByUid/${created.uid}`);
    throw new Error("Passwort-Reset braucht die neue Datenbank-Regel. Die komplette Regel steht im Chat.");
  }
  await logStaff(actor, "Passwort zurückgesetzt", name);
}

export async function removeStaffAccount(username: string, actor: string) {
  const name = staffName(username);
  const row = await fbGet<{ uid?: string }>(`staffUsers/${name}`);
  await fbRemove(`staffUsers/${name}`);
  if (row?.uid) await fbUpdate(`staffByUid/${row.uid}`, { disabled: true, removed: true });
  try {
    await fbRemove(`staffGate/${name}`);
  } catch {
    /* Gate-Regel kann noch fehlen. */
  }
  await logStaff(actor, "Account gelöscht", name);
}

async function claimExisting(name: string, password: string) {
  const open = await fbGet<{ open?: boolean; role?: string }>(`staffOpen/${name}`).catch(() => null);
  if (!open?.open) throw new Error("Zugang ungültig");
  if (password.length < 6) throw new Error("Firebase lässt unter 6 Zeichen nicht zu. Kürzer geht nicht.");
  const email = `${name}${STAFF_MAIL}`;
  const role = open.role || "helper";
  try {
    await createFirebaseUser(email, password);
    const signed = await signInEmail(email, password);
    await fbSet(`staffByUid/${signed.uid}`, { username: name, email, role, disabled: false });
    await fbUpdate(`staffUsers/${name}`, { uid: signed.uid, email, mustChangePw: false, disabled: false });
    await fbSet(`staffGate/${name}`, { email });
    await fbRemove(`staffOpen/${name}`);
    return signed;
  } catch (err) {
    clearFirebaseLogin();
    const message = err instanceof Error ? err.message : "";
    if (message.includes("Datenbank")) {
      throw new Error("Der Name ist erfasst, aber die neue Regel ist noch nicht veröffentlicht. Dann kann die Person selbst ein Passwort setzen.");
    }
    throw err instanceof Error ? err : new Error("Zugang ungültig");
  }
}

export async function loginStaff(nameOrEmail: string, password: string): Promise<StaffSession> {
  const named = nameOrEmail.trim().toLowerCase();
  let clean = staffLoginId(named);
  if (!named.includes("@")) {
    try {
      const gate = await fbGet<{ email?: string }>(`staffGate/${staffName(named)}`);
      if (gate?.email) clean = gate.email;
    } catch {
      clean = staffLoginId(named);
    }
  }
  if (!password) throw new Error("Name und Passwort");
  const nameOnly = named.includes("@") ? "" : staffName(named);
  let signed: { email: string; uid: string };
  try {
    signed = await signInEmail(clean, password);
  } catch (err) {
    if (!nameOnly) throw err;
    signed = await claimExisting(nameOnly, password);
  }
  let link = await fbGet<{ username?: string; role?: string; disabled?: boolean }>(`staffByUid/${signed.uid}`);
  if (!link?.username && nameOnly) {
    try {
      signed = await claimExisting(nameOnly, password);
      link = await fbGet<{ username?: string; role?: string; disabled?: boolean }>(`staffByUid/${signed.uid}`);
    } catch {
      link = link || null;
    }
  }
  if (!link?.username) {
    try {
      await fbSet(`staffByUid/${signed.uid}`, { username: "owner", email: signed.email, role: "owner" });
      await fbSet(`staffUsers/owner`, {
        role: "owner",
        email: signed.email,
        uid: signed.uid,
        mustChangePw: false,
        createdAt: Date.now(),
      });
    } catch {
      clearFirebaseLogin();
      throw new Error("Dieser Account ist keinem Rang zugeordnet. Der Owner muss ihn anlegen.");
    }
    link = { username: "owner", role: "owner" };
  }
  const username = staffName(link.username || "owner");
  const row = await fbGet<{ role?: string; mustChangePw?: boolean; disabled?: boolean; ownerUntil?: number | null }>(
    `staffUsers/${username}`,
  );
  if (!row || row.disabled || link?.disabled) {
    clearFirebaseLogin();
    throw new Error(row?.disabled || link?.disabled ? "Account ist pausiert" : "Zugang ungültig");
  }
  if (row.ownerUntil && row.ownerUntil <= Date.now() && row.role === "owner") {
    clearFirebaseLogin();
    throw new Error("Owner-Zeit abgelaufen");
  }
  await fbUpdate(`staffUsers/${username}`, { lastLogin: Date.now(), email: signed.email, uid: signed.uid });
  void logStaff(username, "Login");
  return { username, role: row.role || link.role || "helper", mustChangePw: Boolean(row.mustChangePw), email: signed.email, uid: signed.uid };
}

export async function loadCommands(): Promise<[string, CommandItem][]> {
  const data = await fbGet<MapOf<CommandItem>>("commands");
  return entries(data).sort((a, b) => (b[1].ts || 0) - (a[1].ts || 0));
}
