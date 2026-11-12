import { SITE } from "@/lib/alpen/site";
import { changeOwnPassword, clearFirebaseLogin, createFirebaseUser, deleteFirebaseUser, ensureIdToken, sendPasswordResetEmail, signInEmail } from "@/lib/alpen/fb-auth";
import { isMoved, loadPath, relayDetail, SecurityDenied, SecurityDown } from "@/lib/alpen/security";
import {
  isMinecraftPlayersResponse,
  minecraftBanKey,
  minecraftBans,
  minecraftPlayersSnapshot,
  hasMinecraftBanReason,
  type MinecraftBan,
  type MinecraftPlayersSnapshot,
} from "@/lib/alpen/minecraft";
import { isPermanentBan, shouldArchivePermanentBan } from "./moderation.ts";
import { normalizeStaffEmail, temporaryStaffPassword } from "./staff-account-flow.ts";

export { hasMinecraftBanReason, minecraftBanKey, minecraftBans, minecraftPlayersSnapshot };
export { isPermanentBan, shouldArchivePermanentBan };
export type { MinecraftBan, MinecraftPlayersSnapshot };

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
  minecraftBanKey?: string;
  minecraftUuid?: string;
  minecraftCreated?: string;
  minecraftSource?: string;
  minecraftExpires?: string;
  pendingMinecraftSync?: boolean;
  reasonSource?: "minecraft" | "staff";
  reasonAddedAt?: number;
  reasonAddedBy?: string;
  by?: string;
  unbannedBy?: string;
  unbannedAt?: number;
  ts?: number;
  text?: string;
  archived?: boolean;
  archiveReason?: string;
  archivedBy?: string;
  archivedAt?: number;
  msg?: string;
  replies?: Record<string, { by?: string; text?: string; ts?: number }>;
  ticketCode?: string;
  topic?: string;
  category?: string;
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
  roles?: Partial<Record<"admin" | "helper" | "supporter", boolean>>;
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
  if (method === "GET" && isMoved(path)) return loadPath(path);
  if (method !== "GET" && isMoved(path)) {
    const moved = await relayDetail(path, method, body);
    if (moved.ok) return moved.data;
    if (moved.status === 401 || moved.status === 403) throw new SecurityDenied("keine Berechtigung");
    if (moved.status === 0 || moved.status >= 500) throw new SecurityDown(moved.error || "nicht erreichbar");
    throw new Error(moved.error || "Speichern abgelehnt");
  }
  return firebaseRaw(path, method, body);
}

async function firebaseRaw(path: string, method: string, body?: unknown) {
  const token = await ensureIdToken();
  const url = new URL(`${ROOT}/${path}.json`);
  if (token) url.searchParams.set("auth", token);
  const res = await fetch(url, {
    method,
    headers: body === undefined ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!res.ok) {
    if (!token || res.status === 401) throw new Error("Bitte neu anmelden. Die Sitzung ist abgelaufen.");
    if (res.status === 403) throw new Error(`Firebase blockt ${method} ${path}. Regeln sind noch nicht die neuen, oder dieser Login ist nicht als Owner-UID gespeichert.`);
    throw new Error("Speichern fehlgeschlagen");
  }
  if (res.status === 204) return null;
  return res.json();
}

export function fbGet<T>(path: string): Promise<T | null> {
  return request(path, "GET") as Promise<T | null>;
}

export async function fbUpdate(path: string, body: unknown) {
  if (!isMoved(path) || !body || typeof body !== "object" || Array.isArray(body)) {
    return request(path, "PATCH", body);
  }
  const patch = body as Record<string, unknown>;
  try {
    return await request(path, "PATCH", body);
  } catch (patchError) {
    const current = await fbGet<Record<string, unknown>>(path).catch(() => null);
    const keys = current && typeof current === "object" && !Array.isArray(current) ? Object.keys(current) : [];
    const nested = keys.filter((key) => current && typeof current[key] === "object" && current[key]).length;
    const oneRecord = current && !Array.isArray(current) && nested < 4 && ("name" in current || "text" in current || "msg" in current || "reason" in current || "status" in current || "archived" in current || "cmd" in current);
    if (!oneRecord || !current) throw patchError;
    return request(path, "PUT", { ...current, ...patch });
  }
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

export async function fetchMinecraftPlayersSnapshot(): Promise<MinecraftPlayersSnapshot> {
  const token = await ensureIdToken();
  if (!token) throw new Error("Bitte neu anmelden. Die Sitzung ist abgelaufen.");
  let res: Response;
  try {
    res = await fetch(`${SITE.securityApi}/api/minecraft/players`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      signal: AbortSignal.timeout(8000),
    });
  } catch {
    throw new Error("Bannliste nicht erreichbar.");
  }
  if (res.status === 401 || res.status === 403) throw new Error("Keine Berechtigung für die Minecraft-Bannliste.");
  if (!res.ok) throw new Error("Bannliste nicht erreichbar.");
  let data: unknown;
  try {
    data = await res.json();
  } catch {
    throw new Error("Minecraft-Abgleich lieferte ungültige Daten.");
  }
  if (!isMinecraftPlayersResponse(data)) {
    throw new Error("Minecraft-Abgleich lieferte ungültige Daten.");
  }
  return minecraftPlayersSnapshot(data);
}

export async function fetchMinecraftBans() {
  return (await fetchMinecraftPlayersSnapshot()).bans;
}

export async function executeMinecraftBan(input: { name: string; duration: string; reason: string }) {
  const token = await ensureIdToken();
  if (!token) throw new Error("Bitte melde dich erneut im Staff-Center an.");

  let response: Response;
  try {
    response = await fetch(`${SITE.panelControlApi}/api/minecraft/ban`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(input),
      cache: "no-store",
    });
  } catch {
    throw new Error("Das Control Center ist momentan nicht erreichbar. Es wurde kein Bann ausgeführt.");
  }

  let data: unknown;
  try {
    data = await response.json();
  } catch {
    throw new Error("Das Control Center lieferte eine ungültige Antwort. Bitte prüfe den Bann im Spiel.");
  }
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error("Das Control Center lieferte eine ungültige Antwort. Bitte prüfe den Bann im Spiel.");
  }
  const row = data as Record<string, unknown>;
  if (!response.ok || row.ok !== true) {
    throw new Error(typeof row.error === "string" ? row.error : "Der Minecraft-Bann ist fehlgeschlagen.");
  }
  if (typeof row.command !== "string" || (row.action !== "ban" && row.action !== "tempban")) {
    throw new Error("Das Control Center bestätigte den Bann nicht eindeutig. Bitte prüfe den Bann im Spiel.");
  }
  return { action: row.action, command: row.command };
}

export async function executeMinecraftUnban(input: { name: string }) {
  const token = await ensureIdToken();
  if (!token) throw new Error("Bitte melde dich erneut im Staff-Center an.");

  let response: Response;
  try {
    response = await fetch(`${SITE.panelControlApi}/api/minecraft/unban`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(input),
      cache: "no-store",
    });
  } catch {
    throw new Error("Das Control Center ist momentan nicht erreichbar. Bitte prüfe den Bannstatus in Minecraft, bevor du es erneut versuchst.");
  }

  let data: unknown;
  try {
    data = await response.json();
  } catch {
    throw new Error("Das Control Center lieferte eine ungültige Antwort. Bitte prüfe den Bann im Spiel.");
  }
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error("Das Control Center lieferte eine ungültige Antwort. Bitte prüfe den Bann im Spiel.");
  }
  const row = data as Record<string, unknown>;
  if (!response.ok || row.ok !== true) {
    throw new Error(typeof row.error === "string" ? row.error : "Der Minecraft-Entbann ist fehlgeschlagen.");
  }
  if (typeof row.command !== "string" || row.action !== "pardon") {
    throw new Error("Das Control Center bestätigte den Entbann nicht eindeutig. Bitte prüfe den Bann im Spiel.");
  }
  return { action: row.action, command: row.command };
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

export function lateDays(value: unknown) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 3;
  return Math.min(30, Math.max(1, Math.round(n)));
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

export async function createStaffAccount(input: { username: string; email: string; role: string; createdBy: string }) {
  const name = staffName(input.username);
  const email = normalizeStaffEmail(input.email);
  const token = await ensureIdToken();
  if (!token) throw new Error("Bitte neu anmelden. Die Sitzung ist abgelaufen.");
  const keep = window.sessionStorage.getItem("alpen-fb-token");
  let created: Awaited<ReturnType<typeof createFirebaseUser>> | null = null;
  let accountLinked = false;
  try {
    const existing = await fbGet<{ uid?: string }>(`staffUsers/${name}`);
    if (existing) throw new Error("Existiert schon");
    created = await createFirebaseUser(email, temporaryStaffPassword());
    if (keep) window.sessionStorage.setItem("alpen-fb-token", keep);
    await fbSet(`staffByUid/${created.uid}`, { username: name, email, role: input.role, disabled: false });
    await fbSet(`staffUsers/${name}`, {
      role: input.role,
      email,
      uid: created.uid,
      mustChangePw: false,
      disabled: false,
      createdAt: Date.now(),
      createdBy: input.createdBy,
    });
    await fbRemove(`staffGate/${name}`);
    accountLinked = true;
  } catch (err) {
    if (keep) window.sessionStorage.setItem("alpen-fb-token", keep);
    const message = err instanceof Error ? err.message : "Anlegen fehlgeschlagen";
    if (message === "Existiert schon") throw new Error(message);
    const cleanupErrors: string[] = [];
    if (created) {
      try {
        await fbRemove(`staffUsers/${name}`);
      } catch (cleanupError) {
        cleanupErrors.push(cleanupError instanceof Error ? cleanupError.message : "Teamkonto");
      }
      try {
        await fbRemove(`staffByUid/${created.uid}`);
      } catch (cleanupError) {
        cleanupErrors.push(cleanupError instanceof Error ? cleanupError.message : "UID-Verknüpfung");
      }
      try {
        await deleteFirebaseUser(created.idToken);
      } catch (cleanupError) {
        cleanupErrors.push(cleanupError instanceof Error ? cleanupError.message : "Firebase-Account");
      }
    }
    if (cleanupErrors.length) {
      throw new Error(`${message}. Bereinigung fehlgeschlagen (${cleanupErrors.join(", ")}); bitte vor einem erneuten Versuch den unvollständigen Account prüfen.`);
    }
    throw new Error(message);
  }
  if (!accountLinked || !created) throw new Error("Account konnte nicht vollständig verknüpft werden.");
  try {
    await sendPasswordResetEmail(email);
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Unbekannter Fehler";
    throw new Error(`Account ist angelegt, aber der Passwort-Link konnte nicht gesendet werden: ${detail}`);
  }
  await logStaff(input.createdBy, "Account angelegt", `${name} · ${input.role}`);
}

async function describeLogin(token: string) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))) as { user_id?: string; sub?: string; email?: string };
    const uid = payload.user_id || payload.sub || "";
    const link = uid ? await fbGet<{ role?: string; username?: string }>(`staffByUid/${uid}`).catch(() => null) : null;
    const owner = await fbGet<{ uid?: string; role?: string }>("staffUsers/owner").catch(() => null);
    const same = owner?.uid && uid && owner.uid === uid ? "UID ist Owner" : "UID ist nicht Owner";
    return `(${payload.email || "ohne E-Mail"}, Rang ${link?.role || "leer"}, Name ${link?.username || "leer"}, ${same}.)`;
  } catch {
    return "(Login konnte nicht gelesen werden.)";
  }
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

export async function resetStaffPassword(username: string, actor: string) {
  const name = staffName(username);
  const row = await fbGet<{ uid?: string; email?: string }>(`staffUsers/${name}`);
  if (!row?.uid) throw new Error("Account fehlt");
  const email = row.email?.trim();
  if (!email || email.endsWith(STAFF_MAIL)) throw new Error("Für diesen Account muss zuerst die persönliche E-Mail-Adresse hinterlegt werden.");
  await fbRemove(`staffGate/${name}`);
  await sendPasswordResetEmail(email);
  await logStaff(actor, "Passwort zurückgesetzt", name);
}

export async function setStaffEmail(username: string, value: string, actor: string) {
  const name = staffName(username);
  const email = normalizeStaffEmail(value);
  const row = await fbGet<{ uid?: string; email?: string; role?: string; disabled?: boolean; mustChangePw?: boolean }>(`staffUsers/${name}`);
  if (!row) throw new Error("Account fehlt");
  if (row.email?.trim().toLowerCase() === email && row.uid) {
    await fbRemove(`staffGate/${name}`);
    await sendPasswordResetEmail(email);
    await logStaff(actor, "Passwort-Setup-Link gesendet", name);
    return;
  }

  const token = await ensureIdToken();
  if (!token) throw new Error("Bitte neu anmelden. Die Sitzung ist abgelaufen.");
  const oldLink = row.uid ? await fbGet<Record<string, unknown>>(`staffByUid/${row.uid}`) : null;
  if (row.uid && !oldLink) {
    throw new Error("Die bestehende UID-Verknüpfung fehlt. Bitte den Account prüfen, bevor die E-Mail geändert wird.");
  }
  const keep = window.sessionStorage.getItem("alpen-fb-token");
  const created = await createFirebaseUser(email, temporaryStaffPassword());
  if (keep) window.sessionStorage.setItem("alpen-fb-token", keep);
  const role = row.role || "helper";
  let linkWriteAttempted = false;
  let oldLinkUpdateAttempted = false;
  let staffUserUpdateAttempted = false;
  try {
    linkWriteAttempted = true;
    await fbSet(`staffByUid/${created.uid}`, { username: name, email, role, disabled: true });
    if (row.uid && oldLink) {
      oldLinkUpdateAttempted = true;
      await fbUpdate(`staffByUid/${row.uid}`, { disabled: true, replacedBy: created.uid });
    }
    staffUserUpdateAttempted = true;
    await fbUpdate(`staffUsers/${name}`, { email, uid: created.uid, mustChangePw: false });
    await fbUpdate(`staffByUid/${created.uid}`, { disabled: Boolean(row.disabled) });
    await fbRemove(`staffGate/${name}`);
  } catch (error) {
    const rollbackErrors: string[] = [];
    if (staffUserUpdateAttempted) {
      try {
        await fbSet(`staffUsers/${name}`, row);
      } catch (rollbackError) {
        rollbackErrors.push(rollbackError instanceof Error ? rollbackError.message : "Teamkonto");
      }
    }
    if (oldLinkUpdateAttempted && row.uid && oldLink) {
      try {
        await fbSet(`staffByUid/${row.uid}`, oldLink);
      } catch (rollbackError) {
        rollbackErrors.push(rollbackError instanceof Error ? rollbackError.message : "Bisherige UID-Verknüpfung");
      }
    }
    if (linkWriteAttempted) {
      try {
        await fbRemove(`staffByUid/${created.uid}`);
      } catch (rollbackError) {
        rollbackErrors.push(rollbackError instanceof Error ? rollbackError.message : "Neue UID-Verknüpfung");
      }
    }
    try {
      await deleteFirebaseUser(created.idToken);
    } catch (rollbackError) {
      rollbackErrors.push(rollbackError instanceof Error ? rollbackError.message : "Neuer Firebase-Account");
    }
    const detail = error instanceof Error ? error.message : "Unbekannter Fehler";
    if (rollbackErrors.length) {
      throw new Error(`E-Mail konnte nicht vollständig gespeichert werden: ${detail}. Wiederherstellung unvollständig (${rollbackErrors.join(", ")}); bitte die Kontoverknüpfung prüfen.`);
    }
    throw new Error(`E-Mail konnte nicht vollständig gespeichert werden: ${detail}`);
  }
  try {
    await sendPasswordResetEmail(email);
  } catch (error) {
    throw new Error(error instanceof Error ? `E-Mail ist gespeichert, aber der Passwort-Link konnte nicht gesendet werden: ${error.message}` : "E-Mail ist gespeichert, aber der Passwort-Link konnte nicht gesendet werden.");
  }
  await logStaff(actor, "E-Mail-Adresse aktualisiert", name);
}

export async function removeStaffAccount(username: string, actor: string) {
  const name = staffName(username);
  const row = await fbGet<{ uid?: string }>(`staffUsers/${name}`);
  await fbRemove(`staffUsers/${name}`);
  if (row?.uid) await fbUpdate(`staffByUid/${row.uid}`, { disabled: true, removed: true });
  await fbRemove(`staffGate/${name}`);
  await logStaff(actor, "Account gelöscht", name);
}

export async function loginStaff(nameOrEmail: string, password: string): Promise<StaffSession> {
  const named = nameOrEmail.trim().toLowerCase();
  if (!password) throw new Error("Name und Passwort");
  const emails: string[] = [];
  const addEmail = (value?: string) => {
    const email = value?.trim().toLowerCase();
    if (email && !emails.includes(email)) emails.push(email);
  };
  if (named.includes("@")) addEmail(named);
  else {
    addEmail(staffLoginId(named));
  }
  let signed: { email: string; uid: string } | null = null;
  let lastError: Error | null = null;
  for (const email of emails) {
    try {
      signed = await signInEmail(email, password);
      break;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error("Zugang ungültig");
    }
  }
  if (!signed) {
    if (lastError && !/ungültig/i.test(lastError.message)) throw lastError;
    throw new Error("Name oder Passwort stimmt nicht.");
  }
  let link = await fbGet<{ username?: string; role?: string; disabled?: boolean }>(`staffByUid/${signed.uid}`);
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
  const row = await fbGet<{ uid?: string; role?: string; mustChangePw?: boolean; disabled?: boolean; ownerUntil?: number | null }>(
    `staffUsers/${username}`,
  );
  if (!row || row.disabled || link?.disabled || (row.uid && row.uid !== signed.uid)) {
    clearFirebaseLogin();
    throw new Error(row?.disabled || link?.disabled ? "Account ist pausiert" : "Der Account ist nicht vollständig angelegt. Im Staff-Center neu anlegen oder das Passwort zurücksetzen.");
  }
  if (row.ownerUntil && row.ownerUntil <= Date.now() && row.role === "owner") {
    clearFirebaseLogin();
    throw new Error("Owner-Zeit abgelaufen");
  }
  await fbUpdate(`staffUsers/${username}`, { lastLogin: Date.now(), email: signed.email, uid: signed.uid }).catch(() => undefined);
  void logStaff(username, "Login");
  return { username, role: row.role || link.role || "helper", mustChangePw: Boolean(row.mustChangePw), email: signed.email, uid: signed.uid };
}

export async function loadCommands(): Promise<[string, CommandItem][]> {
  const data = await fbGet<MapOf<CommandItem>>("commands");
  return entries(data).sort((a, b) => (b[1].ts || 0) - (a[1].ts || 0));
}
