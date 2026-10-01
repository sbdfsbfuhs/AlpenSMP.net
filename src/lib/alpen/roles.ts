export const ROLES = ["owner", "admin", "helper", "supporter", "builder"] as const;
export type Role = (typeof ROLES)[number];

export type Area =
  | "moderation"
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
  | "guide"
  | "website"
  | "lockdown"
  | "archive"
  | "roles"
  | "settings"
  | "mascot";

const ALL: Area[] = [
  "moderation",
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
  "guide",
  "website",
  "lockdown",
  "archive",
  "roles",
  "settings",
  "mascot",
];

const MAP: Record<Role, Area[]> = {
  owner: ALL,
  admin: ALL.filter((area) => area !== "lockdown" && area !== "roles"),
  helper: ["help", "tasks", "absence", "rulesRead", "commandsRead", "settings"],
  supporter: ["help", "helpAct", "tasks", "absence", "rulesRead", "commandsRead", "community", "settings"],
  builder: ["guide", "tasks", "absence", "settings"],
};

export function asRole(value: string | undefined): Role {
  if (value === "owner" || value === "admin" || value === "helper" || value === "supporter" || value === "builder") {
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
