import { createServerFn } from "@tanstack/react-start";
import { loadPath, relayDetail } from "@/lib/alpen/security";
import {
  createTicketCode,
  normalizeTicketCode,
  ticketAccessIsValid,
  TICKET_ACCESS_TTL_MS,
} from "@/lib/alpen/ticket-access";
import { canShowCommunityItem } from "@/lib/alpen/community-consent";

export type ServerStatus = {
  online: boolean;
  players: number;
  max: number;
  version: string;
  software: string;
  motd: string[];
};

export type HistoryPoint = { t: number; n: number };

export type PlayerLeaderboardEntry = { rank: number; name: string; value: number };
export type PlayerLeaderboards = {
  generatedAt: number;
  boards: Record<"playtime" | "player_kills" | "deaths" | "mob_kills", PlayerLeaderboardEntry[]>;
};

export type LiveReview = {
  name: string;
  rating: number;
  text: string;
  ts: number;
  imageUrl?: string;
};

export type Shot = { name: string; caption: string; imageUrl: string; ts: number };

const fetchStatusServer = createServerFn({ method: "POST" }).handler(async () => {
  const server = await import("./live.remote.server.ts");
  server.assertLiveRequest();
  return server.fetchStatus();
});

export function fetchStatus(): Promise<ServerStatus> {
  return fetchStatusServer();
}

const fetchDiscordCountServer = createServerFn({ method: "POST" }).handler(async () => {
  const server = await import("./live.remote.server.ts");
  server.assertLiveRequest();
  return server.fetchDiscordCount();
});

export function fetchDiscordCount(): Promise<number | null> {
  return fetchDiscordCountServer();
}

const fetchSiteStatsServer = createServerFn({ method: "POST" }).handler(async () => {
  const server = await import("./live.remote.server.ts");
  server.assertLiveRequest();
  return server.fetchSiteStats();
});

export function fetchSiteStats(): Promise<{ total: number | null; listed: number | null }> {
  return fetchSiteStatsServer();
}

const fetchHistoryServer = createServerFn({ method: "POST" })
  .validator((limit: unknown) =>
    typeof limit === "number" && Number.isFinite(limit) ? Math.max(20, Math.min(700, limit)) : 120,
  )
  .handler(async ({ data }) => {
    const server = await import("./live.remote.server.ts");
    server.assertLiveRequest();
    return server.fetchHistory(data);
  });

export function fetchHistory(limit = 120): Promise<HistoryPoint[]> {
  return fetchHistoryServer({ data: limit });
}

const fetchPlayerLeaderboardsServer = createServerFn({ method: "POST" }).handler(async () => {
  const server = await import("./live.remote.server.ts");
  server.assertLiveRequest();
  return server.fetchPlayerLeaderboards();
});

export function fetchPlayerLeaderboards(): Promise<PlayerLeaderboards> {
  return fetchPlayerLeaderboardsServer();
}

export async function fetchReviews(): Promise<LiveReview[]> {
  try {
    const data = (await loadPath("community_reviews")) as Record<
      string,
      {
        status?: string;
        name?: string;
        rating?: number;
        text?: string;
        ts?: number;
        imageUrl?: string;
        publicationConsent?: boolean;
        imageRightsConfirmed?: boolean;
      }
    > | null;
    if (!data) return [];
    const shots = await fetchShots().catch(() => []);
    return Object.values(data)
      .filter((row) => row && canShowCommunityItem(row, "review") && (row.text || row.imageUrl))
      .map((row) => {
        const text = String(row.text || "");
        const shot = shots.find(
          (item) =>
            item.name === (row.name || "Spieler") &&
            Math.abs(item.ts - (Number(row.ts) || 0)) < 120_000,
        );
        return {
          name: row.name || "Spieler",
          rating: Number(row.rating) || 5,
          text,
          ts: Number(row.ts) || 0,
          imageUrl: shot?.imageUrl,
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
      {
        status?: string;
        name?: string;
        caption?: string;
        imageUrl?: string;
        ts?: number;
        publicationConsent?: boolean;
        imageRightsConfirmed?: boolean;
      }
    > | null;
    if (!data) return [];
    return Object.values(data)
      .filter((row) => row && canShowCommunityItem(row, "image") && row.imageUrl)
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
  submissionAcknowledged: boolean;
  reviewPublicationConsent: boolean;
  imagePublicationConsent: boolean;
  imageRightsConfirmed: boolean;
}) {
  if (!body.submissionAcknowledged) throw new Error("Bitte bestätige zuerst die interne Prüfung.");
  if ((body.kind === "image" || body.kind === "both") && !body.imageUrl) {
    throw new Error("Bitte wähle zuerst ein Bild aus.");
  }
  if (body.kind === "review" || body.kind === "both") {
    const review = {
      name: body.name,
      text: body.text,
      rating: body.rating,
      kind: body.kind,
      submissionAcknowledged: true,
      consent: { publication: body.reviewPublicationConsent },
    };
    const moved = await relayDetail("community_reviews", "POST", review);
    if (!moved.ok)
      throw new Error(
        readableRelayError(moved.error, "Rezension konnte nicht gespeichert werden."),
      );
  }
  if ((body.kind === "image" || body.kind === "both") && body.imageUrl) {
    const image = {
      name: body.name,
      caption: body.text.slice(0, 120),
      imageUrl: body.imageUrl,
      kind: body.kind,
      submissionAcknowledged: true,
      consent: {
        publication: body.imagePublicationConsent,
        imageRights: body.imageRightsConfirmed,
      },
    };
    const moved = await relayDetail("community_images", "POST", image);
    if (!moved.ok)
      throw new Error(readableRelayError(moved.error, "Bild konnte nicht gespeichert werden."));
  }
}

function readableRelayError(raw: string, fallback: string) {
  if (raw.includes("rate_limited")) return "Zu viele Anfragen. Bitte versuche es später erneut.";
  if (raw.includes("payload_too_large"))
    return "Die übermittelte Nachricht oder Datei ist zu gross. Bitte kürze den Text oder wähle ein kleineres Bild.";
  try {
    const parsed = JSON.parse(raw) as { error?: string };
    if (parsed.error && parsed.error !== "payload_too_large") return parsed.error;
  } catch {
    /* Rohtext */
  }
  return raw && !raw.startsWith("{") ? raw : fallback;
}

export async function submitTicket(input: {
  name: string;
  topic: string;
  msg: string;
  category?: string;
}) {
  const name = input.name.trim().slice(0, 32);
  const category = ["Bug", "Frage", "Beschwerde", "Sonstiges"].includes(input.category || "")
    ? input.category || "Sonstiges"
    : "Sonstiges";
  const topic = input.topic.trim().slice(0, 80);
  const msg = input.msg.trim().slice(0, 800);
  if (name.length < 2 || topic.length < 3 || msg.length < 8)
    throw new Error("Name, Betreff und Beschreibung prüfen.");
  const last = Number(window.localStorage.getItem("alpen-ticket-at") || 0);
  if (Date.now() - last < 60_000)
    throw new Error("Bitte eine Minute warten, bevor du ein weiteres Ticket sendest.");
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
  if (!helpMoved.ok)
    throw new Error(readableRelayError(helpMoved.error, "Ticket konnte nicht gesendet werden."));
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
  if (!saved.ok)
    throw new Error(readableRelayError(saved.error, "Ticket-Code konnte nicht angelegt werden."));
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
