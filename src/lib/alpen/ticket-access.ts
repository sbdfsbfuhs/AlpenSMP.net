export const TICKET_ACCESS_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export function createTicketCode() {
  const bytes = globalThis.crypto.getRandomValues(new Uint8Array(16));
  const token = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("").toUpperCase();
  return `ALP-${token}`;
}

export function normalizeTicketCode(value: string) {
  const code = value.trim().toUpperCase();
  return /^ALP-[A-F0-9]{32}$/.test(code) ? code : null;
}

export function ticketAccessIsValid(expiresAt: unknown, now = Date.now()) {
  return typeof expiresAt === "number" && Number.isFinite(expiresAt) && expiresAt > now;
}
