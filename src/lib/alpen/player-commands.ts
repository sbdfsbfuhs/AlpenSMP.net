import { COMMAND_GROUPS, type CommandGroup, type PlayerCommand } from "./content.ts";

export type EditablePlayerCommand = PlayerCommand & {
  id: string;
  bedrockCmd?: string;
};

export type EditableCommandGroup = Omit<CommandGroup, "rows"> & {
  rows: EditablePlayerCommand[];
};

export type PlayerCommandCatalog = {
  version: 1;
  groups: EditableCommandGroup[];
  updatedAt?: number;
  updatedBy?: string;
};

export type LegacyCommand = { cmd?: string; text?: string };
export type LegacyCommandMap = Record<string, LegacyCommand> | LegacyCommand[] | null | undefined;

function list<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  if (value && typeof value === "object") return Object.values(value) as T[];
  return [];
}

export function canonicalCommand(value: string) {
  return value
    .trim()
    .replace(/\.spieler/gi, " spieler")
    .replace(/\s+/g, " ")
    .toLocaleLowerCase("de");
}

export function commandId(groupId: string, command: string) {
  const slug = command
    .toLocaleLowerCase("de")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `${groupId}-${slug || "befehl"}`;
}

export function seedCommandGroups(): EditableCommandGroup[] {
  return COMMAND_GROUPS.map((group) => ({
    ...group,
    rows: group.rows.map((row) => ({
      ...row,
      id: commandId(group.id, row.cmd),
      bedrockCmd: row.cmd.replaceAll("Spieler", ".Spieler"),
    })),
  }));
}

export function parseCommandCatalog(value: unknown): EditableCommandGroup[] | null {
  if (!value || typeof value !== "object" || !("groups" in value)) return null;
  const groups = list<Record<string, unknown>>((value as { groups?: unknown }).groups).flatMap(
    (rawGroup) => {
      if (typeof rawGroup.id !== "string" || typeof rawGroup.title !== "string") return [];
      const rows = list<Record<string, unknown>>(rawGroup.rows).flatMap((rawRow) => {
        if (typeof rawRow.cmd !== "string" || typeof rawRow.text !== "string") return [];
        const cmd = rawRow.cmd.trim();
        if (!cmd) return [];
        return [
          {
            id:
              typeof rawRow.id === "string" && rawRow.id
                ? rawRow.id
                : commandId(rawGroup.id as string, cmd),
            cmd,
            text: rawRow.text.trim(),
            ...(typeof rawRow.bedrockCmd === "string" && rawRow.bedrockCmd.trim()
              ? { bedrockCmd: rawRow.bedrockCmd.trim() }
              : {}),
            ...(typeof rawRow.href === "string" ? { href: rawRow.href } : {}),
            ...(typeof rawRow.hrefLabel === "string" ? { hrefLabel: rawRow.hrefLabel } : {}),
          },
        ];
      });
      return [
        {
          id: rawGroup.id,
          title: rawGroup.title,
          ...(typeof rawGroup.note === "string" ? { note: rawGroup.note } : {}),
          rows,
        },
      ];
    },
  );
  return groups.length ? groups : null;
}

export function mergeLegacyCommands(
  catalog: unknown,
  java: LegacyCommandMap,
  bedrock: LegacyCommandMap,
): EditableCommandGroup[] {
  const stored = parseCommandCatalog(catalog);
  if (stored) return stored;

  const groups = seedCommandGroups();
  const known = new Set(
    groups.flatMap((group) => group.rows.map((row) => canonicalCommand(row.cmd))),
  );
  const legacy = new Map<string, { cmd: string; bedrockCmd?: string; text: string }>();

  for (const [platform, items] of [
    ["java", java],
    ["bedrock", bedrock],
  ] as const) {
    for (const item of list<LegacyCommand>(items)) {
      if (typeof item.cmd !== "string" || !item.cmd.trim()) continue;
      const cmd = item.cmd.trim();
      const key = canonicalCommand(cmd);
      if (known.has(key)) continue;
      const current = legacy.get(key) ?? {
        cmd: cmd.replace(/\.Spieler/g, "Spieler"),
        text: item.text?.trim() ?? "",
      };
      if (platform === "bedrock") current.bedrockCmd = cmd;
      else current.cmd = cmd;
      if (item.text?.trim()) current.text = item.text.trim();
      legacy.set(key, current);
    }
  }

  if (legacy.size) {
    groups.push({
      id: "weitere",
      title: "Weitere Befehle",
      rows: [...legacy].map(([key, item]) => ({
        ...item,
        id: commandId("weitere", key),
        ...(item.bedrockCmd === item.cmd ? { bedrockCmd: undefined } : {}),
      })),
    });
  }
  return groups;
}

export function toPlayerCommandCatalog(
  groups: EditableCommandGroup[],
  updatedBy: string,
): PlayerCommandCatalog {
  return {
    version: 1,
    groups: groups.map((group) => ({
      ...group,
      rows: group.rows.map((row) => ({
        ...row,
        cmd: row.cmd.trim(),
        text: row.text.trim(),
        ...(row.bedrockCmd?.trim() && row.bedrockCmd.trim() !== row.cmd.trim()
          ? { bedrockCmd: row.bedrockCmd.trim() }
          : { bedrockCmd: undefined }),
      })),
    })),
    updatedAt: Date.now(),
    updatedBy,
  };
}
