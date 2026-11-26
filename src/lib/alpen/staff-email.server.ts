import { createHash } from "node:crypto";
import { isIP } from "node:net";
import { getRequest } from "@tanstack/react-start/server";
import { GoogleAuth } from "google-auth-library";
import { SITE } from "@/lib/alpen/site";
import { STAFF_PASSWORD_RESET_COOLDOWN_MS } from "./staff-email-cooldown.ts";
import { normalizeRecoveryEmail, normalizeStaffEmail } from "./staff-account-flow.ts";
import { renderStaffEmail, type StaffEmailKind } from "./staff-email-template.ts";

type ServiceAccount = {
  project_id: string;
  client_email: string;
  private_key: string;
};

type IdentityErrorPayload = {
  error?: {
    message?: string;
  };
};

type IdentityLookup = {
  users?: Array<{
    localId?: string;
    email?: string;
    emailVerified?: boolean;
  }>;
};

type RateBucket = {
  count: number;
  resetAt: number;
};

const PROJECT_ID = new URL(SITE.fb).hostname.split("-default-rtdb")[0];
const rateBuckets = new Map<string, RateBucket>();
let googleAuth: GoogleAuth | null = null;

class FirebaseActionError extends Error {
  constructor(readonly code: string) {
    super(code);
    this.name = "FirebaseActionError";
  }
}

function getServiceAccount(): ServiceAccount {
  const raw = process.env.FIREBASE_EMAIL_SERVICE_ACCOUNT_JSON;
  if (!raw) throw new Error("Der E-Mail-Dienst ist noch nicht vollständig eingerichtet.");

  let credentials: Partial<ServiceAccount>;
  try {
    credentials = JSON.parse(raw) as Partial<ServiceAccount>;
  } catch {
    throw new Error("Die Firebase-E-Mail-Konfiguration ist ungültig.");
  }

  if (
    credentials.project_id !== PROJECT_ID ||
    typeof credentials.client_email !== "string" ||
    typeof credentials.private_key !== "string"
  ) {
    throw new Error("Die Firebase-E-Mail-Konfiguration passt nicht zum Projekt.");
  }
  return credentials as ServiceAccount;
}

function getGoogleAuth() {
  if (!googleAuth) {
    googleAuth = new GoogleAuth({
      credentials: getServiceAccount(),
      scopes: ["https://www.googleapis.com/auth/cloud-platform"],
    });
  }
  return googleAuth;
}

async function getAccessToken() {
  const client = await getGoogleAuth().getClient();
  const result = await client.getAccessToken();
  if (!result.token) throw new Error("Firebase konnte keinen sicheren E-Mail-Zugriff erteilen.");
  return result.token;
}

function getClientIp() {
  const request = getRequest();
  const candidate =
    request?.headers.get("x-real-ip")?.trim() ||
    request?.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  if (candidate && isIP(candidate)) return candidate;
  if (process.env.NODE_ENV !== "production") return "127.0.0.1";
  throw new Error("Die Anfrage konnte nicht sicher zugeordnet werden. Bitte versuche es erneut.");
}

function hashKey(value: string) {
  return createHash("sha256").update(value).digest("hex").slice(0, 40);
}

function consumeRateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  for (const [bucketKey, bucket] of rateBuckets) {
    if (bucket.resetAt <= now) rateBuckets.delete(bucketKey);
  }
  const current = rateBuckets.get(key);
  if (!current || current.resetAt <= now) {
    rateBuckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (current.count >= limit) return false;
  current.count += 1;
  return true;
}

function allowEmailRequest(email: string, ip: string, uid?: string) {
  const recipientKey = `recipient:${hashKey(email)}`;
  const ipKey = `ip:${hashKey(ip)}`;
  const dailyKey = `daily:${new Date().toISOString().slice(0, 10)}`;
  const userKey = uid ? `uid:${hashKey(uid)}` : "";
  const hour = 60 * 60 * 1000;

  if (!consumeRateLimit(dailyKey, 80, 24 * hour)) return false;
  if (!consumeRateLimit(ipKey, 8, 15 * 60 * 1000)) return false;
  if (!consumeRateLimit(recipientKey, 3, hour)) return false;
  return !userKey || consumeRateLimit(userKey, 3, hour);
}

function allowPasswordResetRequest(email: string, ip: string) {
  if (!allowEmailRequest(email, ip)) return false;
  return consumeRateLimit(`password-reset:${hashKey(email)}`, 1, STAFF_PASSWORD_RESET_COOLDOWN_MS);
}

function publicFirebaseActionError(error: FirebaseActionError) {
  if (error.code === "EMAIL_EXISTS") {
    return new Error("Diese E-Mail-Adresse ist bereits einem anderen Firebase-Konto zugeordnet.");
  }
  if (error.code === "TOO_MANY_ATTEMPTS_TRY_LATER") {
    return new Error("Zu viele Versuche. Bitte warte kurz und versuche es erneut.");
  }
  if (error.code === "INVALID_ID_TOKEN" || error.code === "USER_NOT_FOUND") {
    return new Error("Bitte melde dich erneut an und versuche es noch einmal.");
  }
  console.error("[Staff-E-Mail] Firebase-Aktionslink fehlgeschlagen.", error.code);
  return new Error(
    "Der Bestätigungslink konnte nicht erstellt werden. Bitte versuche es später erneut.",
  );
}

async function requestFirebaseActionLink(body: Record<string, string | boolean>): Promise<string> {
  const accessToken = await getAccessToken();
  let response: Response;
  try {
    response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${encodeURIComponent(SITE.fbKey)}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...body,
          returnOobLink: true,
          targetProjectId: PROJECT_ID,
        }),
        signal: AbortSignal.timeout(10_000),
      },
    );
  } catch {
    throw new Error(
      "Firebase konnte den Aktionslink gerade nicht erstellen. Bitte versuche es später erneut.",
    );
  }
  const payload = (await response.json()) as IdentityErrorPayload & { oobLink?: string };
  if (!response.ok) {
    const code = payload.error?.message?.split(/\s|:/, 1)[0] || "FIREBASE_ERROR";
    throw new FirebaseActionError(code);
  }
  if (typeof payload.oobLink !== "string") {
    throw new Error("Firebase hat keinen Bestätigungslink zurückgegeben.");
  }

  const link = new URL(payload.oobLink);
  if (
    link.protocol !== "https:" ||
    link.hostname !== `${PROJECT_ID}.firebaseapp.com` ||
    !link.searchParams.has("oobCode")
  ) {
    throw new Error("Firebase hat einen ungültigen Bestätigungslink zurückgegeben.");
  }
  return link.toString();
}

async function sendWithResend(kind: StaffEmailKind, email: string, actionUrl: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("Der E-Mail-Versand ist noch nicht vollständig eingerichtet.");
  const from = process.env.ALPEN_EMAIL_FROM || "AlpenSMP <no-reply@alpensmp.net>";
  const template = renderStaffEmail({ kind, actionUrl });
  let response: Response;
  try {
    response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [email],
        subject: template.subject,
        html: template.html,
        text: template.text,
      }),
      signal: AbortSignal.timeout(10_000),
    });
  } catch {
    throw new Error(
      "Der E-Mail-Dienst ist gerade nicht erreichbar. Bitte versuche es später erneut.",
    );
  }
  if (!response.ok) {
    console.error("[Staff-E-Mail] Resend-Versand fehlgeschlagen.", response.status);
    throw new Error(
      "Die E-Mail konnte gerade nicht gesendet werden. Bitte versuche es später erneut.",
    );
  }
}

export async function sendStaffPasswordReset(emailValue: string) {
  const email = normalizeStaffEmail(emailValue);
  const ip = getClientIp();
  if (!allowPasswordResetRequest(email, ip)) return;

  try {
    const actionUrl = await requestFirebaseActionLink({
      requestType: "PASSWORD_RESET",
      email,
      continueUrl: SITE.staff,
      userIp: ip,
    });
    await sendWithResend("password-reset", email, actionUrl);
  } catch (error) {
    if (error instanceof FirebaseActionError && error.code === "EMAIL_NOT_FOUND") return;
    if (error instanceof FirebaseActionError) throw publicFirebaseActionError(error);
    throw error;
  }
}

async function lookupFirebaseUser(idToken: string) {
  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(SITE.fbKey)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
      signal: AbortSignal.timeout(10_000),
    },
  );
  const payload = (await response.json()) as IdentityLookup & IdentityErrorPayload;
  if (!response.ok) {
    const code = payload.error?.message?.split(/\s|:/, 1)[0] || "INVALID_ID_TOKEN";
    if (code === "INVALID_ID_TOKEN" || code === "USER_NOT_FOUND") {
      throw new Error("Bitte melde dich erneut an und versuche es noch einmal.");
    }
    throw new Error("Das Teamkonto konnte nicht sicher geprüft werden.");
  }
  const user = payload.users?.[0];
  if (!user?.localId || !user.email) {
    throw new Error("Das Teamkonto konnte nicht sicher geprüft werden.");
  }
  return {
    uid: user.localId,
    email: normalizeStaffEmail(user.email),
    emailVerified: user.emailVerified === true,
  };
}

export async function sendStaffEmailVerification(input: {
  idToken: string;
  expectedUid: string;
  newEmail: string;
}) {
  const targetEmail = normalizeRecoveryEmail(input.newEmail);
  const user = await lookupFirebaseUser(input.idToken);
  if (user.uid !== input.expectedUid) {
    throw new Error("Der angemeldete Account hat sich geändert. Bitte melde dich erneut an.");
  }
  if (user.email === targetEmail && user.emailVerified) {
    return { email: targetEmail, alreadyVerified: true };
  }

  const ip = getClientIp();
  if (!allowEmailRequest(targetEmail, ip, user.uid)) {
    throw new Error("Zu viele E-Mail-Anfragen. Bitte warte eine Weile und versuche es erneut.");
  }

  const requestType = user.email === targetEmail ? "VERIFY_EMAIL" : "VERIFY_AND_CHANGE_EMAIL";
  const continueUrl = new URL(SITE.staff);
  continueUrl.searchParams.set("staffSetup", "verified");
  let actionUrl: string;
  try {
    actionUrl = await requestFirebaseActionLink({
      requestType,
      email: user.email,
      idToken: input.idToken,
      ...(requestType === "VERIFY_AND_CHANGE_EMAIL" ? { newEmail: targetEmail } : {}),
      continueUrl: continueUrl.toString(),
    });
  } catch (error) {
    if (error instanceof FirebaseActionError) throw publicFirebaseActionError(error);
    throw error;
  }
  await sendWithResend("email-verification", targetEmail, actionUrl);
  return { email: targetEmail, alreadyVerified: false };
}
