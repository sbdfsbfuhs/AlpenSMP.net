import { SITE } from "@/lib/alpen/site";
import { loadPath, relayDetail } from "@/lib/alpen/security";
import { createTicketCode, normalizeTicketCode, ticketAccessIsValid, TICKET_ACCESS_TTL_MS } from "@/lib/alpen/ticket-access";

export type ServerStatus = {
  online: boolean;
  players: number;
  max: number;
  version: string;
  software: string;
  motd: string[];
};

export type HistoryPoint = { t: number; n: number };

export type LiveReview = { name: string; rating: number; text: string; ts: number; imageUrl?: string };

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

type HistoryRow = { t?: number; n?: number; by?: string; total_players_ever?: number };

function isPlayerSample(row: HistoryRow | null | undefined): row is HistoryRow {
  return Boolean(row) && !row?.by && typeof row?.total_players_ever !== "number" && Number(row?.t) > 0;
}

export async function fetchHistory(limit = 120): Promise<HistoryPoint[]> {
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

const SAMPLE_GAP = 15 * 60 * 1000;
const WEEK = 7 * 24 * 60 * 60 * 1000;

export async function recordPlayerSample(players: number) {
  if (!Number.isFinite(players) || players < 0 || players > 1000) return;
  const key = "alpensmp_sample_at";
  const last = Number(localStorage.getItem(key) || 0);
  if (Date.now() - last < SAMPLE_GAP) return;
  const peek = await fetch(`${SITE.fb}/site_stats_history.json?orderBy="$key"&limitToLast=30`);
  if (peek.ok) {
    const latest = (await peek.json()) as Record<string, HistoryRow> | null;
    const row = latest
      ? Object.values(latest)
          .filter(isPlayerSample)
          .sort((a, b) => Number(a.t) - Number(b.t))
          .at(-1)
      : null;
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
  if (Date.now() - Number(localStorage.getItem(key) || 0) < 12 * 60 * 60 * 1000) return;
  localStorage.setItem(key, String(Date.now()));
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

export async function fetchReviews(): Promise<LiveReview[]> {
  try {
    const data = (await loadPath("community_reviews")) as Record<
      string,
      { status?: string; name?: string; rating?: number; text?: string; ts?: number; imageUrl?: string }
    > | null;
    if (!data) return [];
    const shots = await fetchShots().catch(() => []);
    return Object.values(data)
      .filter((row) => row && row.status === "approved" && (row.text || row.imageUrl))
      .map((row) => {
        const text = String(row.text || "");
        const own = typeof row.imageUrl === "string" ? row.imageUrl : "";
        const shot = shots.find((item) => item.name === (row.name || "Spieler") && Math.abs(item.ts - (Number(row.ts) || 0)) < 120_000);
        return {
          name: row.name || "Spieler",
          rating: Number(row.rating) || 5,
          text,
          ts: Number(row.ts) || 0,
          imageUrl: own || shot?.imageUrl,
        };
      })
      .sort((a, b) => b.ts - a.ts);
  } catch {
    return [];
  }
}

export async function fetchShots(): Promise<Shot[]> {
  try {
    const data = (await loadPath("community_images")) as Record<
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
  } catch {
    return [];
  }
}

export async function submitCommunity(body: {
  name: string;
  text: string;
  rating: number;
  kind: "review" | "image" | "both";
  imageUrl: string;
}) {
  if (body.kind === "review" || body.kind === "both") {
    const review = {
      name: body.name,
      text: body.text,
      rating: body.rating,
      kind: body.kind,
      status: "pending",
      ts: Date.now(),
      source: "website",
    };
    const moved = await relayDetail("community_reviews", "POST", review);
    if (!moved.ok) throw new Error(readableRelayError(moved.error, "Rezension konnte nicht gespeichert werden."));
  }
  if ((body.kind === "image" || body.kind === "both") && body.imageUrl) {
    const image = {
      name: body.name,
      caption: body.text.slice(0, 120),
      imageUrl: body.imageUrl,
      status: "pending",
      ts: Date.now(),
    };
    const moved = await relayDetail("community_images", "POST", image);
    if (!moved.ok) throw new Error(readableRelayError(moved.error, "Bild konnte nicht gespeichert werden."));
  }
}

function readableRelayError(raw: string, fallback: string) {
  if (raw.includes("payload_too_large")) return "Der Server nimmt das Bild nicht an. In der Sicherheits-App ist die Grenze 32 KB. Für gute Fotos muss sie auf 1 MB steigen.";
  try {
    const parsed = JSON.parse(raw) as { error?: string };
    if (parsed.error && parsed.error !== "payload_too_large") return parsed.error;
  } catch {
    /* Rohtext */
  }
  return raw && !raw.startsWith("{") ? raw : fallback;
}

export async function submitTicket(input: { name: string; topic: string; msg: string; category?: string }) {
  const name = input.name.trim().slice(0, 32);
  const category = ["Bug", "Frage", "Beschwerde", "Sonstiges"].includes(input.category || "") ? input.category || "Sonstiges" : "Sonstiges";
  const topic = input.topic.trim().slice(0, 80);
  const msg = input.msg.trim().slice(0, 800);
  if (name.length < 2 || topic.length < 3 || msg.length < 8) throw new Error("Name, Betreff und Beschreibung prüfen.");
  const last = Number(window.localStorage.getItem("alpen-ticket-at") || 0);
  if (Date.now() - last < 60_000) throw new Error("Bitte eine Minute warten, bevor du ein weiteres Ticket sendest.");
  const code = createTicketCode();
  const expiresAt = Date.now() + TICKET_ACCESS_TTL_MS;
  const helpBody = {
    by: name,
    msg,
    topic,
    category,
    ts: Date.now(),
    source: "website",
    replies: {},
    ticketCode: code,
    status: "offen",
  };
  const helpMoved = await relayDetail("helpRequests", "POST", helpBody);
  if (!helpMoved.ok) throw new Error(readableRelayError(helpMoved.error, "Ticket konnte nicht gesendet werden."));
  const helpKey = String((helpMoved.data as { name?: string } | null)?.name || "");
  if (!helpKey) throw new Error("Ticket konnte nicht gesendet werden.");
  const ticket = {
    name,
    topic,
    category,
    msg,
    ts: Date.now(),
    replies: {},
    status: "offen",
    helpKey,
    expiresAt,
  };
  const saved = await relayDetail(`tickets/${code}`, "PUT", ticket);
  if (!saved.ok) throw new Error(readableRelayError(saved.error, "Ticket-Code konnte nicht angelegt werden."));
  window.localStorage.setItem("alpen-ticket-at", String(Date.now()));
  return code;
}

export type TicketView = {
  code: string;
  status: string;
  topic: string;
  category: string;
  msg: string;
  replies: { by: string; text: string; ts: number }[];
};

export async function lookupTicket(code: string): Promise<TicketView | null> {
  const clean = normalizeTicketCode(code);
  if (!clean) return null;
  type TicketRow = {
    status?: string;
    topic?: string;
    category?: string;
    msg?: string;
    expiresAt?: number;
    replies?: Record<string, { by?: string; text?: string; msg?: string; ts?: number }> | null;
  };
  let data: TicketRow | null = null;
  try {
    data = (await loadPath(`tickets/${encodeURIComponent(clean)}`)) as TicketRow | null;
  } catch {
    return null;
  }
  if (!data || !ticketAccessIsValid(data.expiresAt)) return null;
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
    category: data.category || "",
    msg: data.msg || "",
    replies: replies.filter((row) => row.text),
  };
}
