export function normalizeStaffEmail(value: string) {
  const email = value.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Bitte eine gültige E-Mail-Adresse eingeben.");
  }
  return email;
}

export function normalizeRecoveryEmail(value: string) {
  const email = normalizeStaffEmail(value);
  if (email.endsWith("@staff.alpensmp.net")) {
    throw new Error("Bitte gib deine persönliche E-Mail-Adresse ein, keine interne Staff-Adresse.");
  }
  return email;
}

export function isInternalStaffEmail(value: string) {
  return value.trim().toLowerCase().endsWith("@staff.alpensmp.net");
}

export function internalStaffEmail(username: string) {
  const name = username.trim().toLowerCase().replace(/\s+/g, "");
  if (!/^[a-z0-9._-]{2,24}$/.test(name)) {
    throw new Error("Name: 2–24 Zeichen, nur Buchstaben, Zahlen, . _ -");
  }
  return `${name}@staff.alpensmp.net`;
}

export function requiresPersonalStaffEmail(email: string, emailVerified: boolean) {
  return !emailVerified || isInternalStaffEmail(email);
}

export function canCompleteFirstStaffPasswordSetup(input: {
  email: string;
  emailVerified: boolean;
  uid: string;
  accountUid?: string;
  mustChangePw?: boolean;
  disabled?: boolean;
  linkedDisabled?: boolean;
}) {
  return input.emailVerified
    && !isInternalStaffEmail(input.email)
    && Boolean(input.uid)
    && input.accountUid === input.uid
    && input.mustChangePw === true
    && input.disabled !== true
    && input.linkedDisabled !== true;
}

export function isNewStaffAccountAwaitingPasswordSetup(input: {
  uid: string;
  accountUid?: string;
  role?: string;
  accountRole?: string;
  mustChangePw?: boolean;
  disabled?: boolean;
  linkedDisabled?: boolean;
}) {
  return Boolean(input.uid)
    && input.accountUid === input.uid
    && Boolean(input.role)
    && input.accountRole === input.role
    && input.mustChangePw === true
    && input.disabled !== true
    && input.linkedDisabled !== true;
}

export function temporaryStaffPassword() {
  const bytes = globalThis.crypto.getRandomValues(new Uint8Array(32));
  return `Alpen!${Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("")}`;
}
