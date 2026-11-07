export type MinecraftBan = {
  name: string;
  reason: string;
  until: string;
  uuid: string;
  created: string;
  source: string;
};

export type MinecraftPlayersSnapshot = {
  players: string[];
  bans: MinecraftBan[];
};

function isMinecraftBanRecord(value: unknown): value is Record<string, unknown> & { name: string } {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const row = value as Record<string, unknown>;
  return typeof row.name === "string" && Boolean(row.name.trim())
    && ["uuid", "reason", "created", "source", "expires"].every((key) => row[key] == null || typeof row[key] === "string");
}

export function isMinecraftPlayersResponse(data: unknown): data is { players: string[]; bans: Record<string, unknown>[] } {
  if (!data || typeof data !== "object" || Array.isArray(data)) return false;
  const record = data as Record<string, unknown>;
  return Array.isArray(record.players)
    && record.players.every((name) => typeof name === "string")
    && Array.isArray(record.bans)
    && record.bans.every(isMinecraftBanRecord);
}

export function minecraftBans(data: unknown): MinecraftBan[] {
  let source = "";
  let rows: unknown[] = [];
  if (Array.isArray(data)) {
    rows = data;
    source = "list";
  } else if (data && typeof data === "object") {
    const record = data as Record<string, unknown>;
    for (const key of ["banned", "bans", "players", "list", "data"]) {
      if (Array.isArray(record[key])) {
        rows = record[key] as unknown[];
        source = key;
        break;
      }
    }
  }
  return rows.flatMap((item) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) return [];
    const row = item as Record<string, unknown>;
    const ban = row.ban && typeof row.ban === "object" && !Array.isArray(row.ban) ? (row.ban as Record<string, unknown>) : null;
    const text = (value: unknown) => (typeof value === "string" ? value.trim() : "");
    const name = text(row.name) || text(row.player) || text(row.username) || text(ban?.name);
    if (!name) return [];
    const reason = text(row.reason) || text(row.banReason) || text(ban?.reason);
    const listedAsBan = source === "list" || source === "banned" || source === "bans";
    const banned = listedAsBan || row.banned === true || row.isBanned === true || Boolean(ban) || Boolean(text(row.banReason));
    if (!banned) return [];
    const until = text(row.until) || text(row.expires) || text(ban?.until) || text(ban?.expires);
    const permanent = row.permanent === true || ban?.permanent === true || listedAsBan;
    return [{
      name,
      reason: reason || "–",
      until: until || (permanent ? "Permanent" : "–"),
      uuid: text(row.uuid) || text(row.id) || text(ban?.uuid),
      created: text(row.created) || text(row.createdAt) || text(ban?.created) || text(ban?.createdAt),
      source: text(row.source) || text(row.by) || text(ban?.source) || text(ban?.by),
    }];
  });
}

export function minecraftPlayersSnapshot(data: unknown): MinecraftPlayersSnapshot {
  const record = data && typeof data === "object" && !Array.isArray(data)
    ? data as Record<string, unknown>
    : {};
  const players = Array.isArray(record.players)
    ? record.players.flatMap((item) => {
      if (typeof item === "string") return item.trim() ? [item.trim()] : [];
      if (!item || typeof item !== "object" || Array.isArray(item)) return [];
      const row = item as Record<string, unknown>;
      const name = row.name ?? row.player ?? row.username;
      return typeof name === "string" && name.trim() ? [name.trim()] : [];
    })
    : [];
  const bans = minecraftBans(data);
  return {
    players: [...new Set([...players, ...bans.map((ban) => ban.name)])]
      .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" })),
    bans,
  };
}

export function minecraftBanKey(ban: MinecraftBan) {
  return `${ban.uuid || ban.name.toLowerCase()}:${ban.created || ban.until || "unknown"}`;
}

export function hasMinecraftBanReason(value: string | null | undefined) {
  const reason = (value || "")
    .replace(/§[0-9a-fk-or]/gi, "")
    .trim()
    .toLowerCase()
    .replace(/[.!?]+$/, "");
  return Boolean(reason && !["–", "-", "kein grund genannt", "kein bann-grund hinterlegt", "the ban hammer has spoken"].includes(reason));
}
