import { useEffect, useRef, useState } from "react";
import { useLive } from "@/components/site/staff-live";
import {
  commandId,
  mergeLegacyCommands,
  toPlayerCommandCatalog,
  type EditableCommandGroup,
  type LegacyCommand,
} from "@/lib/alpen/player-commands";
import { can } from "@/lib/alpen/roles";
import { fbSet } from "@/lib/alpen/staff";

type Note = (text: string) => void;

export function PlayerCommandEditor({
  real,
  view,
  username,
  note,
}: {
  real: string;
  view: string;
  username: string;
  note: Note;
}) {
  const catalog = useLive<unknown>("playerCommands/catalog");
  const java = useLive<LegacyCommand>("playerCommands/java");
  const bedrock = useLive<LegacyCommand>("playerCommands/bedrock");
  const sourceKey = JSON.stringify([catalog, java, bedrock]);
  const dirtyRef = useRef(false);
  const [dirty, setDirty] = useState(false);
  const [groups, setGroups] = useState<EditableCommandGroup[]>(() =>
    mergeLegacyCommands(null, null, null),
  );
  const [groupId, setGroupId] = useState("claims");
  const [commandQuery, setCommandQuery] = useState("");
  const [editingCommandId, setEditingCommandId] = useState<string | null>(null);
  const [newCommand, setNewCommand] = useState({ cmd: "", bedrockCmd: "", text: "" });
  const [saving, setSaving] = useState(false);
  const editable = can(real, "commandsEdit") && can(view, "commandsEdit");

  useEffect(() => {
    if (dirtyRef.current) return;
    const [storedCatalog, javaCommands, bedrockCommands] = JSON.parse(sourceKey) as [
      unknown,
      Record<string, LegacyCommand>,
      Record<string, LegacyCommand>,
    ];
    const next = mergeLegacyCommands(storedCatalog, javaCommands, bedrockCommands);
    setGroups(next);
  }, [sourceKey]);

  useEffect(() => {
    if (!groups.some((group) => group.id === groupId)) {
      setGroupId(groups[0]?.id ?? "");
    }
  }, [groups, groupId]);

  function changeCommand(
    groupId: string,
    commandId: string,
    changes: Partial<EditableCommandGroup["rows"][number]>,
  ) {
    dirtyRef.current = true;
    setDirty(true);
    setGroups((current) =>
      current.map((group) =>
        group.id === groupId
          ? {
              ...group,
              rows: group.rows.map((row) => (row.id === commandId ? { ...row, ...changes } : row)),
            }
          : group,
      ),
    );
  }

  function addCommand() {
    if (!editable) return note("Deine echte Rolle darf Befehle nicht bearbeiten");
    const cmd = newCommand.cmd.trim();
    const text = newCommand.text.trim();
    if (!cmd || !text) return note("Befehl und Beschreibung sind erforderlich");
    if (
      groups.some((group) =>
        group.rows.some((row) => row.cmd.toLocaleLowerCase("de") === cmd.toLocaleLowerCase("de")),
      )
    ) {
      return note("Diesen Java-Befehl gibt es bereits");
    }
    if (!groups.some((group) => group.id === groupId))
      return note("Bitte zuerst eine Befehlsgruppe auswählen");
    dirtyRef.current = true;
    setDirty(true);
    setGroups((current) =>
      current.map((group) =>
        group.id === groupId
          ? {
              ...group,
              rows: [
                ...group.rows,
                {
                  id: commandId(group.id, cmd),
                  cmd,
                  text,
                  ...(newCommand.bedrockCmd.trim()
                    ? { bedrockCmd: newCommand.bedrockCmd.trim() }
                    : {}),
                },
              ],
            }
          : group,
      ),
    );
    setNewCommand({ cmd: "", bedrockCmd: "", text: "" });
  }

  function removeCommand(groupId: string, commandId: string) {
    if (!editable) return note("Deine echte Rolle darf Befehle nicht bearbeiten");
    dirtyRef.current = true;
    setDirty(true);
    setGroups((current) =>
      current.map((group) =>
        group.id === groupId
          ? { ...group, rows: group.rows.filter((row) => row.id !== commandId) }
          : group,
      ),
    );
  }

  async function save() {
    if (!editable) return note("Deine echte Rolle darf Befehle nicht bearbeiten");
    if (!dirty) return note("Es gibt keine ungespeicherten Änderungen");
    setSaving(true);
    try {
      await fbSet("playerCommands/catalog", toPlayerCommandCatalog(groups, username));
      dirtyRef.current = false;
      setDirty(false);
      note("Befehls-Katalog gespeichert");
    } catch (error) {
      console.error(
        "[Staff Center] COMMANDS-SAVE-001: Befehls-Katalog konnte nicht gespeichert werden.",
        error,
      );
      note(
        `COMMANDS-SAVE-001 · Speichern fehlgeschlagen: ${error instanceof Error ? error.message : "Unbekannter Fehler"}`,
      );
    } finally {
      setSaving(false);
    }
  }

  const selectedGroup = groups.find((group) => group.id === groupId);
  const normalizedCommandQuery = commandQuery.trim().toLocaleLowerCase();
  const visibleRows = selectedGroup?.rows
    .filter((row) =>
      row.id === editingCommandId || [row.cmd, row.bedrockCmd, row.text]
          .filter(Boolean)
          .join(" ")
          .toLocaleLowerCase()
          .includes(normalizedCommandQuery),
    )
    .sort((first, second) => first.cmd.localeCompare(second.cmd, "de")) ?? [];

  return (
    <section className="card card-still space-y-5 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Spieler-Befehle</h2>
          <p className="mt-1 text-sm text-muted">
            Gemeinsamer Katalog für Guide, Features-Seite und Website-Suche. Wähle eine Gruppe und bearbeite einzelne Befehle bei Bedarf.
          </p>
        </div>
        {editable && dirty ? (
          <button
            className="btn-brand"
            type="button"
            disabled={saving}
            onClick={() => void save()}
          >
            {saving ? "Speichert…" : "Änderungen speichern"}
          </button>
        ) : editable ? <span className="rounded-full border border-line px-3 py-1 text-sm text-muted">Änderungen gespeichert</span> : null}
      </div>

      <label className="grid max-w-md gap-1 text-sm font-medium">
        Befehlsgruppe
        <select
          className="field"
          value={groupId}
          onChange={(event) => {
            setGroupId(event.target.value);
            setEditingCommandId(null);
            setCommandQuery("");
          }}
        >
          {groups.map((group) => (
            <option key={group.id} value={group.id}>
              {group.title} ({group.rows.length})
            </option>
          ))}
        </select>
      </label>

      {selectedGroup ? (
        <div className="space-y-3">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <p className="text-sm text-muted">{selectedGroup.rows.length} {selectedGroup.rows.length === 1 ? "Befehl" : "Befehle"} in „{selectedGroup.title}“</p>
            {selectedGroup.rows.length > 0 ? (
              <label className="block w-full text-sm font-medium sm:max-w-sm">
                Befehle in dieser Gruppe suchen
                <input
                  className="field mt-1"
                  type="search"
                  value={commandQuery}
                  onChange={(event) => setCommandQuery(event.target.value)}
                  placeholder="Befehl oder Beschreibung"
                />
              </label>
            ) : null}
          </div>
          {visibleRows.map((row) => {
            const editing = editingCommandId === row.id;
            return (
              <article key={row.id} className="rounded-lg border border-line p-3 sm:p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <code className="font-semibold text-brand">{row.cmd}</code>
                    {row.bedrockCmd ? <p className="mt-1 text-xs text-faint">Bedrock: <code>{row.bedrockCmd}</code></p> : null}
                    <p className="mt-2 text-sm text-muted">{row.text}</p>
                  </div>
                  {editable ? (
                    <button
                      className="btn-ghost px-3"
                      type="button"
                      aria-expanded={editing}
                      onClick={() => setEditingCommandId(editing ? null : row.id)}
                    >
                      {editing ? "Schließen" : "Bearbeiten"}
                    </button>
                  ) : null}
                </div>
                {editing ? (
                  <div className="mt-4 grid gap-2 border-t border-line pt-4 md:grid-cols-2">
                    <label className="grid gap-1 text-xs text-muted">
                      Java-Befehl
                      <input
                        className="field"
                        value={row.cmd}
                        disabled={!editable}
                        onChange={(event) =>
                          changeCommand(selectedGroup.id, row.id, { cmd: event.target.value })
                        }
                      />
                    </label>
                    <label className="grid gap-1 text-xs text-muted">
                      Bedrock-Befehl <span className="font-normal">(optional)</span>
                      <input
                        className="field"
                        value={row.bedrockCmd ?? ""}
                        disabled={!editable}
                        placeholder="Wie Java, falls gleich"
                        onChange={(event) =>
                          changeCommand(selectedGroup.id, row.id, { bedrockCmd: event.target.value })
                        }
                      />
                    </label>
                    <label className="grid gap-1 text-xs text-muted md:col-span-2">
                      Beschreibung
                      <textarea
                        className="field min-h-20"
                        value={row.text}
                        disabled={!editable}
                        onChange={(event) =>
                          changeCommand(selectedGroup.id, row.id, { text: event.target.value })
                        }
                      />
                    </label>
                    <button
                      className="btn-ghost justify-self-start"
                      type="button"
                      onClick={() => {
                        removeCommand(selectedGroup.id, row.id);
                        setEditingCommandId(null);
                      }}
                    >
                      Befehl entfernen
                    </button>
                  </div>
                ) : null}
              </article>
            );
          })}
          {!selectedGroup.rows.length ? (
            <p className="text-sm text-muted">In dieser Gruppe sind noch keine Befehle.</p>
          ) : null}
          {selectedGroup.rows.length > 0 && !visibleRows.length ? (
            <p className="text-sm text-muted">Keine Befehle passen zu dieser Suche.</p>
          ) : null}
        </div>
      ) : (
        <p className="text-sm text-muted">Keine Befehlsgruppen verfügbar.</p>
      )}

      {editable ? (
        <details className="rounded-lg border border-line p-3">
          <summary className="cursor-pointer font-semibold">Befehl zu „{selectedGroup?.title || "Gruppe"}“ hinzufügen</summary>
          <fieldset className="mt-3 grid gap-2 md:grid-cols-2" disabled={saving || !selectedGroup}>
            <label className="grid gap-1 text-xs text-muted">
              Java-Befehl
              <input
                className="field"
                placeholder="/spawn"
                value={newCommand.cmd}
                onChange={(event) => setNewCommand({ ...newCommand, cmd: event.target.value })}
              />
            </label>
            <label className="grid gap-1 text-xs text-muted">
              Bedrock-Befehl <span className="font-normal">(optional)</span>
              <input
                className="field"
                placeholder="Wie Java, falls gleich"
                value={newCommand.bedrockCmd}
                onChange={(event) => setNewCommand({ ...newCommand, bedrockCmd: event.target.value })}
              />
            </label>
            <label className="grid gap-1 text-xs text-muted md:col-span-2">
              Beschreibung
              <textarea
                className="field min-h-20"
                placeholder="Kurze Erklärung"
                value={newCommand.text}
                onChange={(event) => setNewCommand({ ...newCommand, text: event.target.value })}
              />
            </label>
            <button className="btn-ghost justify-self-start" type="button" onClick={addCommand}>
              Zur Gruppe hinzufügen
            </button>
          </fieldset>
        </details>
      ) : (
        <p className="text-sm text-muted">Du kannst den Katalog ansehen, aber nicht bearbeiten.</p>
      )}
    </section>
  );
}
