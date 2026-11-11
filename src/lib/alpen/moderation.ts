export type PermanentBanState = {
  archived?: boolean;
  pending?: boolean;
  duration?: string;
  endsAt?: number | null;
  confirmedAt?: number;
  ts?: number;
};

export function isPermanentBan(item: { duration?: string; endsAt?: number | null }) {
  if (item.endsAt) return false;
  const duration = (item.duration || "").toLowerCase();
  return duration.includes("perm") || duration.includes("∞");
}

export function shouldArchivePermanentBan(item: PermanentBanState, now = Date.now()) {
  if (item.archived || item.pending || !isPermanentBan(item)) return false;
  const start = item.confirmedAt || item.ts || 0;
  return start > 0 && now - start >= 86_400_000;
}
