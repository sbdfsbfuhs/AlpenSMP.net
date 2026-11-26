export const STAFF_PASSWORD_RESET_COOLDOWN_MS = 60_000;
export const STAFF_PASSWORD_RESET_COOLDOWN_KEY = "alpen-staff-password-reset-until";

export function remainingPasswordResetCooldownSeconds(expiresAt: number, now: number) {
  if (!Number.isFinite(expiresAt) || !Number.isFinite(now)) return 0;
  return Math.max(0, Math.ceil((expiresAt - now) / 1000));
}
