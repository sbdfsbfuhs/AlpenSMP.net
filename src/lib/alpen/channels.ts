import { SITE } from "@/lib/alpen/site";

export const CHANNEL_PLATFORMS = [
  { id: "youtube", label: "YouTube" },
  { id: "twitch", label: "Twitch" },
  { id: "tiktok", label: "TikTok" },
  { id: "kick", label: "Kick" },
  { id: "instagram", label: "Instagram" },
  { id: "other", label: "Sonstiges" },
] as const;

export type ChannelPlatform = (typeof CHANNEL_PLATFORMS)[number]["id"];

export type Channel = {
  label: string;
  url: string;
  platform: ChannelPlatform;
};

export const DEFAULT_CHANNELS: Channel[] = [
  { label: "YouTube", platform: "youtube", url: "https://www.youtube.com/@Lennart-p9v" },
];

export const CHANNEL_LIMIT = 8;

export type ChannelBoard = {
  set?: boolean;
  items?: Record<string, Partial<Channel>> | null;
};

export function asPlatform(value: string | undefined): ChannelPlatform {
  return CHANNEL_PLATFORMS.some((item) => item.id === value) ? (value as ChannelPlatform) : "other";
}

export function cleanChannelUrl(raw: string): string | null {
  const value = raw.trim();
  if (!value) return null;
  const withProto = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  let url: URL;
  try {
    url = new URL(withProto);
  } catch {
    return null;
  }
  if (url.protocol !== "https:") return null;
  if (url.username || url.password) return null;
  if (!url.hostname.includes(".") || url.hostname === "https") return null;
  return url.toString();
}

export function channelsFromBoard(data: ChannelBoard | null): { custom: boolean; items: Channel[] } {
  if (!data?.set) return { custom: false, items: DEFAULT_CHANNELS.map((item) => ({ ...item })) };
  const source = data.items && typeof data.items === "object" ? Object.values(data.items) : [];
  const items = source
    .map((row) => {
      const url = cleanChannelUrl(String(row?.url || ""));
      const label = String(row?.label || "").trim().slice(0, 32);
      if (!url || !label) return null;
      return { label, url, platform: asPlatform(row?.platform) };
    })
    .filter((row): row is Channel => row !== null)
    .slice(0, CHANNEL_LIMIT);
  return { custom: true, items };
}

let inflight: Promise<Channel[]> | null = null;

export function loadPublicChannels(): Promise<Channel[]> {
  if (inflight) return inflight;
  const job = fetch(`${SITE.fb}/site_stats/channelBoard.json`)
    .then((res) => (res.ok ? res.json() : null))
    .then((data: ChannelBoard | null) => channelsFromBoard(data).items)
    .catch(() => DEFAULT_CHANNELS.map((item) => ({ ...item })))
    .finally(() => {
      inflight = null;
    });
  inflight = job;
  return job;
}
