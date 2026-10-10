import { SITE } from "@/lib/alpen/site";

export type ServerStatus = {
  online: boolean;
  players: number;
  max: number;
  version: string;
  software: string;
  motd: string[];
};

export type HistoryPoint = { t: number; n: number };

export type LiveReview = { name: string; rating: number; text: string; ts: number };

export type Shot = { name: string; caption: string; imageUrl: string; ts: number };

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

export async function fetchHistory(): Promise<HistoryPoint[]> {
  const res = await fetch(`${SITE.fb}/site_stats_history.json?orderBy="$key"&limitToLast=2200`);
  if (!res.ok) return [];
  const data = (await res.json()) as Record<string, { t?: number; n?: number; by?: string }> | null;
  if (!data) return [];
  return Object.values(data)
    .filter((row) => row && !row.by)
    .map((row) => ({ t: Number(row.t) || 0, n: Number(row.n) || 0 }))
    .filter((row) => row.t > 0)
    .sort((a, b) => a.t - b.t);
}

const SAMPLE_GAP = 5 * 60 * 1000;
const WEEK = 7 * 24 * 60 * 60 * 1000;

export async function recordPlayerSample(players: number) {
  if (!Number.isFinite(players) || players < 0 || players > 1000) return;
  const key = "alpensmp_sample_at";
  const last = Number(localStorage.getItem(key) || 0);
  if (Date.now() - last < SAMPLE_GAP) return;
  const peek = await fetch(`${SITE.fb}/site_stats_history.json?orderBy="$key"&limitToLast=1`);
  if (peek.ok) {
    const latest = (await peek.json()) as Record<string, { t?: number }> | null;
    const row = latest ? Object.values(latest)[0] : null;
    if (row?.t && Date.now() - row.t < SAMPLE_GAP) {
      localStorage.setItem(key, String(row.t));
      return;
    }
  }
  const res = await fetch(`${SITE.fb}/site_stats_history.json`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ t: Date.now(), n: players, online_count: players }),
  });
  if (res.ok) localStorage.setItem(key, String(Date.now()));
  else localStorage.setItem(key, String(Date.now() - 3 * 60 * 1000));
}

export async function pruneOldHistory() {
  const key = "alpensmp_prune_at";
  if (Date.now() - Number(localStorage.getItem(key) || 0) < 10 * 60 * 1000) return;
  localStorage.setItem(key, String(Date.now()));
  const cutoff = Date.now() - WEEK;
  for (let batch = 0; batch < 30; batch += 1) {
    const res = await fetch(`${SITE.fb}/site_stats_history.json?orderBy="$key"&limitToFirst=80`);
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
    if (old.length < 80) return;
  }
}

export async function fetchReviews(): Promise<LiveReview[]> {
  const res = await fetch(`${SITE.fb}/community_reviews.json`);
  if (!res.ok) return [];
  const data = (await res.json()) as Record<
    string,
    { status?: string; name?: string; rating?: number; text?: string; ts?: number }
  > | null;
  if (!data) return [];
  return Object.values(data)
    .filter((row) => row && row.status === "approved" && row.text)
    .map((row) => ({
      name: row.name || "Spieler",
      rating: Number(row.rating) || 5,
      text: String(row.text),
      ts: Number(row.ts) || 0,
    }))
    .sort((a, b) => b.ts - a.ts);
}

export async function fetchShots(): Promise<Shot[]> {
  const res = await fetch(`${SITE.fb}/community_images.json`);
  if (!res.ok) return [];
  const data = (await res.json()) as Record<
    string,
    { status?: string; name?: string; caption?: string; imageUrl?: string; ts?: number }
  > | null;
  if (!data) return [];
  return Object.values(data)
    .filter((row) => row && row.status === "approved" && row.imageUrl)
    .map((row) => ({
      name: row.name || "Community",
      caption: row.caption || "",
      imageUrl: row.imageUrl as string,
      ts: Number(row.ts) || 0,
    }))
    .sort((a, b) => b.ts - a.ts);
}

export async function submitCommunity(body: {
  name: string;
  text: string;
  rating: number;
  kind: "review" | "image" | "both";
  imageUrl: string;
}) {
  const base = {
    name: body.name,
    text: body.text,
    rating: body.rating,
    kind: body.kind,
    imageUrl: body.imageUrl,
    status: "pending",
    ts: Date.now(),
    source: "website",
  };
  if (body.kind === "review" || body.kind === "both") {
    const res = await fetch(`${SITE.fb}/community_reviews.json`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(base),
    });
    if (!res.ok) throw new Error("Rezension konnte nicht gespeichert werden.");
  }
  if ((body.kind === "image" || body.kind === "both") && body.imageUrl) {
    const res = await fetch(`${SITE.fb}/community_images.json`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: body.name,
        caption: body.text.slice(0, 120),
        imageUrl: body.imageUrl,
        status: "pending",
        ts: Date.now(),
      }),
    });
    if (!res.ok) throw new Error("Bild konnte nicht gespeichert werden.");
  }
}

export async function submitTicket(input: { name: string; topic: string; msg: string }) {
  const code = "ALP-" + Math.random().toString(36).slice(2, 6).toUpperCase();
  const help = await fetch(`${SITE.fb}/helpRequests.json`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      by: input.name,
      msg: (input.topic ? `[${input.topic}] ` : "") + input.msg,
      ts: Date.now(),
      source: "website",
      replies: {},
      ticketCode: code,
    }),
  });
  if (!help.ok) throw new Error("Ticket konnte nicht gesendet werden.");
  const pushed = (await help.json()) as { name?: string };
  const saved = await fetch(`${SITE.fb}/tickets/${code}.json`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: input.name,
      topic: input.topic,
      msg: input.msg,
      ts: Date.now(),
      replies: {},
      status: "offen",
      helpKey: pushed.name || "",
    }),
  });
  if (!saved.ok) throw new Error("Ticket-Code konnte nicht angelegt werden.");
  return code;
}

export type TicketView = {
  code: string;
  status: string;
  topic: string;
  msg: string;
  replies: { by: string; text: string; ts: number }[];
};

export async function lookupTicket(code: string): Promise<TicketView | null> {
  const clean = code.trim().toUpperCase();
  const res = await fetch(`${SITE.fb}/tickets/${encodeURIComponent(clean)}.json`);
  if (!res.ok) return null;
  const data = (await res.json()) as {
    status?: string;
    topic?: string;
    msg?: string;
    replies?: Record<string, { by?: string; text?: string; msg?: string; ts?: number }> | null;
  } | null;
  if (!data) return null;
  const replies = data.replies
    ? Object.values(data.replies).map((row) => ({
        by: row.by || "Team",
        text: row.text || row.msg || "",
        ts: Number(row.ts) || 0,
      }))
    : [];
  return {
    code: clean,
    status: data.status || "offen",
    topic: data.topic || "",
    msg: data.msg || "",
    replies: replies.filter((row) => row.text),
  };
}
