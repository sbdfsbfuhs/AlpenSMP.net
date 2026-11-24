export const STAFF_ACTIVITY_CONSENT_VERSION = "staff-activity-v2";

export class StaffActivityConsentRequired extends Error {
  constructor() {
    super("Bitte bestätige die notwendige Aktivitäts-Einwilligung.");
    this.name = "StaffActivityConsentRequired";
  }
}

export function isValidMinecraftUsername(value: unknown): value is string {
  return typeof value === "string" && /^[A-Za-z0-9_]{3,16}$/.test(value);
}

export function hasCurrentStaffActivityConsent(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const consent = value as { version?: unknown; acceptedAt?: unknown; minecraftName?: unknown };
  return (
    consent.version === STAFF_ACTIVITY_CONSENT_VERSION &&
    typeof consent.acceptedAt === "number" &&
    Number.isFinite(consent.acceptedAt) &&
    consent.acceptedAt > 0 &&
    isValidMinecraftUsername(consent.minecraftName)
  );
}
