import { SITE } from "@/lib/alpen/site";
import { assertSameSiteRequest } from "@/lib/auth/isolation.server";
import type { HistoryPoint, ServerStatus } from "./live";

type HistoryRow = { t?: number; n?: number; by?: string; total_players_ever?: number };

function isPlayerSample(row: HistoryRow | null | undefined): row is HistoryRow {
  return Boolean(row)
    && !row?.by
    && typeof row?.total_players_ever !== "number"
    && typeof row?.t === "number" && Number.isSafeInteger(row.t)
    && row.t <= Date.now()
    && typeof row?.n === "number" && Number.isSafeInteger(row.n)
    && row.n >= 0 && row.n <= 1000;
}

export function assertLiveRequest(): void {
  assertSameSiteRequest();
}

export async function fetchStatus(): Promise<ServerStatus> {
  const res = await fetch(`https://api.mcsrvstat.us/3/${SITE.ip}`);
  if (!res.ok) throw new Error("Status nicht erreichbar");
  const data = (await res.json()) as {
    online?: boolean;
    players?: { online?: number; max?: number };
    version?: string;
    software?: string;
    motd?: { clean?: string[] };
  };
  return {
    online: Boolean(data.online),
    players: data.players?.online ?? 0,
    max: data.players?.max ?? 0,
    version: data.version || SITE.version,
    software: data.software || "Paper",
    motd: data.motd?.clean?.filter(Boolean) ?? [],
  };
}

export async function fetchDiscordCount(): Promise<number | null> {
  const res = await fetch(`https://discord.com/api/v9/invites/${SITE.discordCode}?with_counts=true`);
  if (!res.ok) return null;
  const data = (await res.json()) as { approximate_member_count?: number };
  return typeof data.approximate_member_count === "number" ? data.approximate_member_count : null;
}

export async function fetchSiteStats(): Promise<{ total: number | null; listed: number | null }> {
  const res = await fetch(`${SITE.fb}/site_stats.json`);
  if (!res.ok) return { total: null, listed: null };
  const data = (await res.json()) as { total_players_ever?: number; current_players?: number } | null;
  return {
    total: typeof data?.total_players_ever === "number" ? data.total_players_ever : null,
    listed: typeof data?.current_players === "number" ? data.current_players : null,
  };
}

export async function fetchHistory(limit: number): Promise<HistoryPoint[]> {
  const cap = Math.max(20, Math.min(700, limit));
  const url = new URL(`${SITE.securityApi}/api/stats/history`);
  url.searchParams.set("limit", String(cap));
  const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) throw new Error("Verlauf nicht erreichbar");
  const data = (await res.json()) as HistoryRow[];
  if (!Array.isArray(data)) throw new Error("Ungültige Verlaufsdaten");
  return data
    .filter(isPlayerSample)
    .map((row) => ({ t: Number(row.t) || 0, n: Number(row.n) || 0 }))
    .sort((a, b) => a.t - b.t);
}
