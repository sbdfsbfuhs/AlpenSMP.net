import { SITE } from "@/lib/alpen/site";

const KEY = "alpen-fb-token";

type Stored = {
  idToken: string;
  refreshToken: string;
  expiresAt: number;
  email: string;
  uid: string;
};

export type FirebaseLogin = {
  email: string;
  uid: string;
};

function readStored(): Stored | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Stored) : null;
  } catch {
    return null;
  }
}

function writeStored(value: Stored | null) {
  if (!value) sessionStorage.removeItem(KEY);
  else sessionStorage.setItem(KEY, JSON.stringify(value));
}

function fail(code: string): Error {
  if (code === "CONFIGURATION_NOT_FOUND") {
    return new Error("E-Mail-Anmeldung ist in Firebase noch aus. Authentication → Sign-in method → E-Mail/Passwort einschalten.");
  }
  if (code === "EMAIL_EXISTS") return new Error("Diese E-Mail gibt es schon");
  if (code === "TOO_MANY_ATTEMPTS_TRY_LATER") return new Error("Zu viele Versuche. Kurz warten.");
  if (code.startsWith("WEAK_PASSWORD")) return new Error("Firebase lässt unter 6 Zeichen nicht zu. Kürzer geht nicht.");
  if (code === "INVALID_EMAIL") return new Error("E-Mail ungültig");
  if (code === "INVALID_LOGIN_CREDENTIALS" || code === "EMAIL_NOT_FOUND" || code === "INVALID_PASSWORD") {
    return new Error("Zugang ungültig");
  }
  return new Error(code || "Anmeldung fehlgeschlagen");
}

async function authPost(path: string, body: Record<string, unknown>) {
  const res = await fetch(`https://identitytoolkit.googleapis.com/v1/${path}?key=${SITE.fbKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await res.json()) as { error?: { message?: string }; localId?: string; idToken?: string; refreshToken?: string; expiresIn?: string; email?: string };
  if (!res.ok) throw fail(data.error?.message || "FEHLER");
  return data;
}

function storeFrom(data: { localId?: string; idToken?: string; refreshToken?: string; expiresIn?: string; email?: string }, email: string) {
  if (!data.idToken || !data.refreshToken || !data.localId) throw new Error("Anmeldung fehlgeschlagen");
  const stored: Stored = {
    idToken: data.idToken,
    refreshToken: data.refreshToken,
    expiresAt: Date.now() + Number(data.expiresIn || 3600) * 1000,
    email: data.email || email,
    uid: data.localId,
  };
  writeStored(stored);
  return stored;
}

export function currentLogin(): FirebaseLogin | null {
  const stored = readStored();
  if (!stored) return null;
  return { email: stored.email, uid: stored.uid };
}

export function clearFirebaseLogin() {
  writeStored(null);
}

export async function ensureIdToken(): Promise<string | null> {
  const stored = readStored();
  if (!stored) return null;
  if (stored.expiresAt > Date.now() + 60_000) return stored.idToken;
  const res = await fetch(`https://securetoken.googleapis.com/v1/token?key=${SITE.fbKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "refresh_token", refresh_token: stored.refreshToken }),
  });
  const data = (await res.json()) as { id_token?: string; refresh_token?: string; expires_in?: string; user_id?: string; error?: { message?: string } };
  if (!res.ok || !data.id_token || !data.refresh_token) {
    writeStored(null);
    return null;
  }
  const next: Stored = {
    idToken: data.id_token,
    refreshToken: data.refresh_token,
    expiresAt: Date.now() + Number(data.expires_in || 3600) * 1000,
    email: stored.email,
    uid: data.user_id || stored.uid,
  };
  writeStored(next);
  return next.idToken;
}

export async function signInEmail(email: string, password: string) {
  const clean = email.trim().toLowerCase();
  const data = await authPost("accounts:signInWithPassword", { email: clean, password, returnSecureToken: true });
  return storeFrom(data, clean);
}

export async function changeOwnPassword(password: string) {
  const idToken = await ensureIdToken();
  if (!idToken) throw new Error("Bitte neu anmelden");
  const data = await authPost("accounts:update", { idToken, password, returnSecureToken: true });
  const stored = readStored();
  storeFrom(data, stored?.email || "");
}

export async function createFirebaseUser(email: string, password: string) {
  const clean = email.trim().toLowerCase();
  try {
    const data = await authPost("accounts:signUp", { email: clean, password, returnSecureToken: true });
    if (!data.localId) throw new Error("Account konnte nicht angelegt werden");
    return { email: clean, uid: data.localId };
  } catch (err) {
    const message = err instanceof Error ? err.message : "";
    if (!message.includes("gibt es schon")) throw err;
    try {
      const data = await authPost("accounts:signInWithPassword", { email: clean, password, returnSecureToken: true });
      if (!data.localId) throw new Error("belegt");
      return { email: clean, uid: data.localId };
    } catch {
      throw new Error("Der Name ist schon belegt und das Passwort passt nicht. Anderen Namen nehmen.");
    }
  }
}
