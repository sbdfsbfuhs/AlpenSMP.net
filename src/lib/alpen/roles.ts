export const ROLES = ["owner", "admin", "helper", "supporter", "builder", "streamer"] as const;
export type Role = (typeof ROLES)[number];

export type Area =
  | "moderation"
  | "moderationRead"
  | "notes"
  | "notesRead"
  | "help"
  | "helpAct"
  | "commandsRead"
  | "commandsEdit"
  | "staffCommands"
  | "community"
  | "rulesRead"
  | "rulesEdit"
  | "banGuide"
  | "banGuideEdit"
  | "tasks"
  | "absence"
  | "absenceAll"
  | "guide"
  | "website"
  | "lockdown"
  | "archive"
  | "roles"
  | "settings"
  | "mascot"
  | "roster"
  | "chat"
  | "builderChat"
  | "search"
  | "news"
  | "status"
  | "stream"
  | "season"
  | "channels"
  | "console";

const ALL: Area[] = [
  "moderation",
  "moderationRead",
  "notes",
  "notesRead",
  "help",
  "helpAct",
  "commandsRead",
  "commandsEdit",
  "staffCommands",
  "community",
  "rulesRead",
  "rulesEdit",
  "banGuide",
  "banGuideEdit",
  "tasks",
  "absence",
  "absenceAll",
  "guide",
  "website",
  "lockdown",
  "archive",
  "roles",
  "settings",
  "mascot",
  "roster",
  "chat",
  "builderChat",
  "search",
  "news",
  "status",
  "stream",
  "season",
  "channels",
  "console",
];

const MAP: Record<Role, Area[]> = {
  owner: ALL,
  admin: [
    "moderation",
    "moderationRead",
    "notes",
    "notesRead",
    "help",
    "helpAct",
    "community",
    "rulesRead",
    "tasks",
    "absence",
    "website",
    "archive",
    "settings",
    "roster",
    "chat",
    "search",
    "news",
    "status",
    "season",
    "channels",
    "console",
  ],
  helper: [
    "moderation",
    "moderationRead",
    "help",
    "community",
    "banGuide",
    "tasks",
    "absence",
    "rulesRead",
    "commandsRead",
    "settings",
    "roster",
    "notesRead",
    "chat",
    "search",
    "console",
  ],
  supporter: [
    "moderationRead",
    "notes",
    "notesRead",
    "help",
    "helpAct",
    "tasks",
    "absence",
    "rulesRead",
    "commandsRead",
    "community",
    "settings",
    "roster",
    "chat",
    "search",
  ],
  builder: ["guide", "tasks", "absence", "settings", "roster", "chat", "builderChat", "search"],
  streamer: ["stream"],
};

export function asRole(value: string | undefined): Role {
  if (
    value === "owner" ||
    value === "admin" ||
    value === "helper" ||
    value === "supporter" ||
    value === "builder" ||
    value === "streamer"
  ) {
    return value;
  }
  return "helper";
}

export function can(role: string | undefined, area: Area) {
  return MAP[asRole(role)].includes(area);
}

export function roleLabel(role: string) {
  const name = asRole(role);
  return name.charAt(0).toUpperCase() + name.slice(1);
}
