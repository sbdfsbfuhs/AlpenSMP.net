export const STREAM_PLATFORMS = [
  { id: "twitch", label: "Twitch", placeholder: "https://twitch.tv/deinname" },
  { id: "youtube", label: "YouTube", placeholder: "https://youtube.com/@deinkanal" },
  { id: "tiktok", label: "TikTok Live", placeholder: "https://tiktok.com/@deinname" },
  { id: "kick", label: "Kick", placeholder: "https://kick.com/deinname" },
  { id: "other", label: "Sonstige", placeholder: "https://deine-plattform.de/..." },
] as const;

export type StreamPlatformId = (typeof STREAM_PLATFORMS)[number]["id"];

const PLATFORM_LABELS = new Map<string, string>(STREAM_PLATFORMS.map(({ id, label }) => [id, label]));

export function normalizeStreamPlatforms(value: unknown, fallback?: string): StreamPlatformId[] {
  const values = Array.isArray(value) ? value : [];
  const known = new Set<string>(STREAM_PLATFORMS.map(({ id }) => id));
  const result = [...new Set(values.filter((id): id is StreamPlatformId => typeof id === "string" && known.has(id)))];
  const fallbackId = STREAM_PLATFORMS.find(({ id }) => id === fallback)?.id;
  if (!result.length && fallbackId) result.push(fallbackId);
  return result;
}

export type LiveStreamDestination = {
  id: string;
  label: string;
  url: string;
};

export function liveStreamDestinations(stream: {
  platform?: string;
  platforms?: unknown;
  url?: string;
  platformLinks?: Record<string, string> | null;
} | null | undefined): LiveStreamDestination[] {
  if (!stream) return [];
  const knownPlatforms = normalizeStreamPlatforms(stream.platforms, stream.platform);
  const platforms = knownPlatforms.length
    ? knownPlatforms
    : stream.platform?.trim()
      ? [stream.platform.trim()]
      : [];

  return platforms
    .map((id) => ({
      id,
      label: PLATFORM_LABELS.get(id) || id,
      url: stream.platformLinks?.[id]?.trim() || (id === stream.platform ? stream.url?.trim() || "" : ""),
    }))
    .filter((destination) => destination.url.length > 0);
}
