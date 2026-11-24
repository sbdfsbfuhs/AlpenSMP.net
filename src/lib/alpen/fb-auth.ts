import { SITE } from "@/lib/alpen/site";
import { getApps, initializeApp } from "firebase/app";
import {
  getAuth,
  getIdTokenResult,
  getMultiFactorResolver,
  inMemoryPersistence,
  initializeAuth,
  multiFactor,
  signInWithEmailAndPassword,
  signOut,
  TotpMultiFactorGenerator,
  type Auth,
  type MultiFactorError,
  type MultiFactorResolver,
  type TotpSecret,
  type User,
} from "firebase/auth";

const KEY = "alpen-fb-token";

type Stored = {
  idToken: string;
  refreshToken: string;
  expiresAt: number;
  email: string;
  uid: string;
  mfaEnabled?: boolean;
};

export type FirebaseLogin = {
  email: string;
  uid: string;
  mfaEnabled: boolean;
};

export class FirebaseMfaChallengeRequired extends Error {
  constructor() {
    super("Gib den aktuellen Code aus deiner Authenticator-App ein.");
    this.name = "FirebaseMfaChallengeRequired";
  }
}

const STAFF_AUTH_APP = "alpen-staff-center";
let staffAuthInstance: Auth | null = null;
let pendingMfaResolver: MultiFactorResolver | null = null;
let pendingMfaEmail = "";
let pendingTotpSecret: TotpSecret | null = null;

function getStaffAuth() {
  if (staffAuthInstance) return staffAuthInstance;
  const projectId = new URL(SITE.fb).hostname.split("-default-rtdb")[0];
  if (!projectId) throw new Error("Firebase-Projekt konnte nicht bestimmt werden.");
  const app =
    getApps().find((candidate) => candidate.name === STAFF_AUTH_APP) ||
    initializeApp(
      {
        apiKey: SITE.fbKey,
        authDomain: `${projectId}.firebaseapp.com`,
        databaseURL: SITE.fb,
        projectId,
      },
      STAFF_AUTH_APP,
    );
  try {
    staffAuthInstance = initializeAuth(app, { persistence: inMemoryPersistence });
  } catch (error) {
    if (!(error instanceof Error) || !("code" in error) || error.code !== "auth/already-initialized")
      throw error;
    staffAuthInstance = getAuth(app);
  }
  return staffAuthInstance;
}

function authErrorMessage(error: unknown) {
  const code =
    error && typeof error === "object" && "code" in error && typeof error.code === "string"
      ? error.code
      : "";
  if (code === "auth/operation-not-allowed" || code === "auth/multi-factor-auth-not-enabled")
    return "Firebase Identity Platform muss TOTP-Zwei-Faktor-Anmeldung zuerst aktivieren.";
  if (code === "auth/invalid-verification-code" || code === "auth/invalid-verification-id")
    return "Der Authenticator-Code ist ungültig oder abgelaufen.";
  if (code === "auth/requires-recent-login")
    return "Bitte melde dich erneut an und wiederhole den Vorgang.";
  if (code === "auth/email-not-verified")
    return "Bitte verifiziere zuerst deine Konto-E-Mail-Adresse.";
  if (error instanceof Error) return error.message;
  return "Firebase-Anmeldung fehlgeschlagen.";
}

async function saveSdkUser(user: User): Promise<FirebaseLogin> {
  const idToken = await user.getIdToken(true);
  const tokenResult = await getIdTokenResult(user);
  const expiresAt = Date.parse(tokenResult.expirationTime);
  const mfaEnabled = multiFactor(user).enrolledFactors.some(
    (factor) => factor.factorId === TotpMultiFactorGenerator.FACTOR_ID,
  );
  writeStored({
    idToken,
    refreshToken: user.refreshToken,
    expiresAt: Number.isFinite(expiresAt) ? expiresAt : Date.now() + 55 * 60 * 1000,
    email: user.email || "",
    uid: user.uid,
    mfaEnabled,
  });
  return { email: user.email || "", uid: user.uid, mfaEnabled };
}

function getTotpHint(resolver: MultiFactorResolver) {
  const hint = resolver.hints.find(
    (factor) => factor.factorId === TotpMultiFactorGenerator.FACTOR_ID,
  );
  if (!hint) throw new Error("Dieses Konto verlangt einen nicht unterstützten zweiten Faktor.");
  return hint;
}

async function resolveTotpSignIn(resolver: MultiFactorResolver, code: string) {
  if (!/^\d{6}$/.test(code.trim())) throw new Error("Bitte gib einen sechsstelligen Authenticator-Code ein.");
  try {
    const assertion = TotpMultiFactorGenerator.assertionForSignIn(getTotpHint(resolver).uid, code.trim());
    const credential = await resolver.resolveSignIn(assertion);
    pendingMfaResolver = null;
    pendingMfaEmail = "";
    return saveSdkUser(credential.user);
  } catch (error) {
    throw new Error(authErrorMessage(error));
  }
}

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
  if (code === "EMAIL_EXISTS") return new Error("Diese E-Mail ist bereits registriert");
  if (code === "EMAIL_NOT_FOUND") return new Error("E-Mail oder Passwort falsch");
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

function storeFrom(
  data: { localId?: string; idToken?: string; refreshToken?: string; expiresIn?: string; email?: string },
  email: string,
  mfaEnabled = false,
) {
  if (!data.idToken || !data.refreshToken || !data.localId) throw new Error("Anmeldung fehlgeschlagen");
  const stored: Stored = {
    idToken: data.idToken,
    refreshToken: data.refreshToken,
    expiresAt: Date.now() + Number(data.expiresIn || 3600) * 1000,
    email: data.email || email,
    uid: data.localId,
    mfaEnabled,
  };
  writeStored(stored);
  return stored;
}

export function currentLogin(): FirebaseLogin | null {
  const stored = readStored();
  if (!stored) return null;
  return { email: stored.email, uid: stored.uid, mfaEnabled: Boolean(stored.mfaEnabled) };
}

export function clearFirebaseLogin() {
  writeStored(null);
  pendingMfaResolver = null;
  pendingMfaEmail = "";
  pendingTotpSecret = null;
  if (staffAuthInstance) {
    void signOut(staffAuthInstance).catch((error: unknown) => {
      console.error("[Staff Center] Auth-Sitzung konnte nicht vollständig beendet werden.", error);
    });
  }
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

export async function signInEmail(email: string, password: string, totpCode = "") {
  const clean = email.trim().toLowerCase();
  const auth = getStaffAuth();
  if (pendingMfaResolver && pendingMfaEmail === clean) {
    if (!totpCode) throw new FirebaseMfaChallengeRequired();
    return resolveTotpSignIn(pendingMfaResolver, totpCode);
  }
  pendingMfaResolver = null;
  pendingMfaEmail = "";
  try {
    const credential = await signInWithEmailAndPassword(auth, clean, password);
    return saveSdkUser(credential.user);
  } catch (error) {
    const code =
      error && typeof error === "object" && "code" in error && typeof error.code === "string"
        ? error.code
        : "";
    if (code === "auth/multi-factor-auth-required") {
      pendingMfaResolver = getMultiFactorResolver(auth, error as MultiFactorError);
      pendingMfaEmail = clean;
      if (totpCode) return resolveTotpSignIn(pendingMfaResolver, totpCode);
      throw new FirebaseMfaChallengeRequired();
    }
    throw new Error(authErrorMessage(error));
  }
}

export async function beginStaffTotpEnrollment(email: string, password: string) {
  let credential;
  try {
    credential = await signInWithEmailAndPassword(getStaffAuth(), email.trim().toLowerCase(), password);
  } catch (error) {
    throw new Error(authErrorMessage(error));
  }
  if (!credential.user.emailVerified)
    throw new Error("Bitte verifiziere zuerst deine Konto-E-Mail-Adresse, bevor du 2FA einrichtest.");
  if (
    multiFactor(credential.user).enrolledFactors.some(
      (factor) => factor.factorId === TotpMultiFactorGenerator.FACTOR_ID,
    )
  ) {
    throw new Error("Für dieses Konto ist bereits ein Authenticator eingerichtet.");
  }
  try {
    const session = await multiFactor(credential.user).getSession();
    pendingTotpSecret = await TotpMultiFactorGenerator.generateSecret(session);
    return {
      secret: pendingTotpSecret.secretKey,
      uri: pendingTotpSecret.generateQrCodeUrl(email.trim().toLowerCase(), "AlpenSMP Staff Center"),
    };
  } catch (error) {
    throw new Error(authErrorMessage(error));
  }
}

export async function finishStaffTotpEnrollment(code: string) {
  const user = getStaffAuth().currentUser;
  if (!user || !pendingTotpSecret) throw new Error("Starte zuerst die 2FA-Einrichtung erneut.");
  if (!/^\d{6}$/.test(code.trim())) throw new Error("Bitte gib einen sechsstelligen Authenticator-Code ein.");
  try {
    const assertion = TotpMultiFactorGenerator.assertionForEnrollment(pendingTotpSecret, code.trim());
    await multiFactor(user).enroll(assertion, "AlpenSMP Staff Center");
    pendingTotpSecret = null;
    return saveSdkUser(user);
  } catch (error) {
    throw new Error(authErrorMessage(error));
  }
}

export async function disableStaffTotp(email: string, password: string, code: string) {
  await signInEmail(email, password, code);
  const user = getStaffAuth().currentUser;
  if (!user) throw new Error("Bitte melde dich erneut an.");
  const factor = multiFactor(user).enrolledFactors.find(
    (candidate) => candidate.factorId === TotpMultiFactorGenerator.FACTOR_ID,
  );
  if (!factor) throw new Error("Für dieses Konto ist kein Authenticator eingerichtet.");
  try {
    await multiFactor(user).unenroll(factor.uid);
    return saveSdkUser(user);
  } catch (error) {
    throw new Error(authErrorMessage(error));
  }
}

export async function changeOwnPassword(password: string) {
  const idToken = await ensureIdToken();
  if (!idToken) throw new Error("Bitte neu anmelden");
  const data = await authPost("accounts:update", { idToken, password, returnSecureToken: true });
  const stored = readStored();
  storeFrom(data, stored?.email || "", Boolean(stored?.mfaEnabled));
}

export async function sendPasswordResetEmail(email: string) {
  const clean = email.trim().toLowerCase();
  if (!clean || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) throw new Error("Bitte eine gültige E-Mail-Adresse eingeben.");
  const continueUrl = typeof window === "undefined" ? undefined : `${window.location.origin}/team`;
  try {
    await authPost("accounts:sendOobCode", {
      requestType: "PASSWORD_RESET",
      email: clean,
      ...(continueUrl ? { continueUrl } : {}),
    });
  } catch (error) {
    if (error instanceof Error && error.message === "E-Mail oder Passwort falsch") return;
    throw error;
  }
}

export async function createFirebaseUser(email: string, password: string) {
  const clean = email.trim().toLowerCase();
  const data = await authPost("accounts:signUp", { email: clean, password, returnSecureToken: true });
  if (!data.localId || !data.idToken) throw new Error("Account konnte nicht angelegt werden");
  return { email: clean, uid: data.localId, idToken: data.idToken };
}

export async function deleteFirebaseUser(idToken: string) {
  await authPost("accounts:delete", { idToken });
}
