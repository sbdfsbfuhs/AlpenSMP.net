import { Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CopyBurstButton } from "@/components/site/copy-burst";
import { usePlayerCommandGroups } from "@/components/site/player-commands-context";
import { type EditableCommandGroup } from "@/lib/alpen/player-commands";

export function PlayerCommands({ initiallyCollapsed = false }: { initiallyCollapsed?: boolean }) {
  const { groups, error } = usePlayerCommandGroups();
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState(!initiallyCollapsed);
  const filteredGroups = useMemo(() => {
    const term = query.trim().toLocaleLowerCase("de");
    if (!term) return groups;
    return groups
      .map((group) => ({
        ...group,
        rows: group.rows.filter((item) =>
          [item.cmd, item.bedrockCmd ?? "", item.text].some((value) =>
            value.toLocaleLowerCase("de").includes(term),
          ),
        ),
      }))
      .filter((group) => group.rows.length > 0);
  }, [groups, query]);
  const commandCount = groups.reduce((count, group) => count + group.rows.length, 0);

  return (
    <section>
      <details
        className="player-commands-disclosure"
        open={expanded}
        onToggle={(event) => setExpanded(event.currentTarget.open)}
      >
        <summary className="player-commands-summary">
          <span>
            <span className="kicker">Für alle Spieler</span>
            <span className="display mt-2 block text-3xl">Spieler-Befehle</span>
            <span className="mt-2 block text-sm text-muted">
              Java und Bedrock · {commandCount} Befehle in {groups.length} Gruppen
            </span>
          </span>
          <span className="btn-ghost shrink-0">{expanded ? "Schliessen" : "Befehle anzeigen"}</span>
        </summary>
        <div className="mt-5">
          <p className="max-w-2xl text-sm text-muted">
            Java: Chat mit T. Bedrock: Chat-Taste; Spielernamen beginnen mit einem Punkt.
          </p>
          {error ? (
            <details className="mt-4 rounded-md border border-ember/40 bg-ember/10 px-4 py-3 text-sm">
              <summary className="cursor-pointer font-medium text-fg">
                Gespeicherte Änderungen nicht erreichbar; die bestätigte Grundliste wird angezeigt.
              </summary>
              <p className="mt-2 break-words text-muted">{error}</p>
            </details>
          ) : null}
          <label className="mt-5 block">
            <span className="sr-only">Spieler-Befehle durchsuchen</span>
            <input
              className="field"
              type="search"
              value={query}
              placeholder="Befehl oder Thema suchen, z. B. /home oder Claim"
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <p className="mt-2 text-xs text-faint">
            {query ? `${filteredGroups.reduce((count, group) => count + group.rows.length, 0)} Treffer` : "Wähle eine Gruppe oder suche direkt."}
          </p>
          <div className="mt-5 space-y-3">
            {filteredGroups.map((group) => (
              <details
                id={`commands-${group.id}`}
                key={group.id}
                className="player-command-group scroll-mt-24"
                open={query.trim() ? true : undefined}
              >
                <summary className="flex cursor-pointer items-center justify-between gap-3 p-4">
                  <span className="font-semibold">{group.title}</span>
                  <span className="text-sm text-faint">{group.rows.length}</span>
                </summary>
                <div className="px-4 pb-4">
                  {group.note ? <p className="mb-3 text-sm text-muted">{group.note}</p> : null}
                  <ul className="grid gap-3 md:grid-cols-2">
                    {group.rows.map((item) => (
                      <CommandRow key={item.id} item={item} />
                    ))}
                  </ul>
                </div>
              </details>
            ))}
            {!filteredGroups.length ? (
              <p className="rounded-md border border-line p-4 text-sm text-muted">
                Keine passenden Befehle gefunden. Prüfe die Schreibweise oder suche nach einem Thema wie „Team“ oder „Teleport“.
              </p>
            ) : null}
          </div>
        </div>
      </details>
    </section>
  );
}

function CommandRow({ item }: { item: EditableCommandGroup["rows"][number] }) {
  const java = item.cmd;
  const bedrock = item.bedrockCmd ?? item.cmd.replaceAll("Spieler", ".Spieler");
  const same = java === bedrock;
  return (
    <li className="card card-still p-4">
      <p className="text-sm text-muted">{item.text}</p>
      {same ? (
        <div className="mt-3 flex items-center gap-3">
          <code className="min-w-0 flex-1 font-semibold text-brand">{java}</code>
          <CopyBurstButton value={java} ariaLabel={`${java} kopieren`}>
            Kopieren
          </CopyBurstButton>
        </div>
      ) : (
        <div className="mt-3 space-y-2">
          <CommandCopy label="Java" command={java} />
          <CommandCopy label="Bedrock" command={bedrock} />
        </div>
      )}
      {item.href ? (
        <Link to={item.href} className="mt-2 inline-flex text-sm text-brand underline">
          {item.hrefLabel || "Weiter"}
        </Link>
      ) : null}
    </li>
  );
}

function CommandCopy({ label, command }: { label: string; command: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-16 shrink-0 text-xs text-faint">{label}</span>
      <code className="min-w-0 flex-1 font-semibold text-brand">{command}</code>
      <CopyBurstButton value={command} ariaLabel={`${command} kopieren`}>
        Kopieren
      </CopyBurstButton>
    </div>
  );
}
