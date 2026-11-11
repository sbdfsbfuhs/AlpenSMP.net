export function normalizeStaffEmail(value: string) {
  const email = value.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Bitte eine gültige E-Mail-Adresse eingeben.");
  }
  return email;
}

export function temporaryStaffPassword() {
  const bytes = globalThis.crypto.getRandomValues(new Uint8Array(32));
  return `Alpen!${Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("")}`;
}
