import { SITE } from "@/lib/alpen/site";
import { assertSameSiteRequest } from "@/lib/auth/isolation.server";
import type { HistoryPoint, ServerStatus } from "./live";

type HistoryRow = { t?: number; n?: number; by?: string; total_players_ever?: number };

function isPlayerSample(row: HistoryRow | null | undefined): row is HistoryRow {
  return Boolean(row) && !row?.by && typeof row?.total_players_ever !== "number" && Number(row?.t) > 0;
}

const SAMPLE_GAP = 15 * 60 * 1000;
const WEEK = 7 * 24 * 60 * 60 * 1000;

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
  const res = await fetch(`${SITE.fb}/site_stats_history.json?orderBy="$key"&limitToLast=${cap}`);
  if (!res.ok) return [];
  const data = (await res.json()) as Record<string, HistoryRow> | null;
  if (!data) return [];
  return Object.values(data)
    .filter(isPlayerSample)
    .map((row) => ({ t: Number(row.t) || 0, n: Number(row.n) || 0 }))
    .sort((a, b) => a.t - b.t);
}

export async function recordPlayerSample(): Promise<number | null> {
  const status = await fetchStatus();
  if (!status.online || !Number.isFinite(status.players) || status.players < 0 || status.players > 1000) {
    return null;
  }

  const peek = await fetch(`${SITE.fb}/site_stats_history.json?orderBy="$key"&limitToLast=30`);
  if (peek.ok) {
    const latest = (await peek.json()) as Record<string, HistoryRow> | null;
    const row = latest
      ? Object.values(latest)
          .filter(isPlayerSample)
          .sort((a, b) => Number(a.t) - Number(b.t))
          .at(-1)
      : null;
    if (row?.t && Date.now() - row.t < SAMPLE_GAP) return row.t;
  }

  const res = await fetch(`${SITE.fb}/site_stats_history.json`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ t: Date.now(), n: status.players, online_count: status.players }),
  });
  return res.ok ? Date.now() : null;
}

export async function pruneOldHistory(): Promise<void> {
  const cutoff = Date.now() - WEEK;
  for (let batch = 0; batch < 2; batch += 1) {
    const res = await fetch(`${SITE.fb}/site_stats_history.json?orderBy="$key"&limitToFirst=40`);
    if (!res.ok) return;
    const data = (await res.json()) as Record<string, { t?: number }> | null;
    if (!data) return;
    const old = Object.entries(data).filter(([, row]) => Number(row?.t) > 0 && Number(row.t) < cutoff);
    if (!old.length) return;
    const removed = await Promise.all(
      old.map(async ([id]) => {
        const gone = await fetch(`${SITE.fb}/site_stats_history/${id}.json`, { method: "DELETE" });
        return gone.ok;
      }),
    );
    if (!removed.some(Boolean)) return;
    if (old.length < 40) return;
  }
}
