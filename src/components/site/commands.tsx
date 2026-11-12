import { Link } from "@tanstack/react-router";
import { CopyBurstButton } from "@/components/site/copy-burst";
import { usePlayerCommandGroups } from "@/components/site/player-commands-context";
import { type EditableCommandGroup } from "@/lib/alpen/player-commands";

export function PlayerCommands() {
  const { groups, error } = usePlayerCommandGroups();

  return (
    <section>
      <p className="kicker">Für alle Spieler</p>
      <h2 className="display mt-2 text-3xl">Spieler-Befehle</h2>
      <p className="mt-3 max-w-2xl text-sm text-muted">
        Eine gemeinsame, aktuelle Befehlsliste für Java und Bedrock. Java: Chat mit T. Bedrock:
        Chat-Taste; Spielernamen beginnen mit einem Punkt.
      </p>
      {error ? (
        <p
          className="mt-4 rounded-md border border-ember/40 bg-ember/10 px-4 py-3 text-sm text-fg"
          role="status"
        >
          {error} Die bestätigte Grundliste bleibt sichtbar.
        </p>
      ) : null}
      <div className="mt-8 space-y-8">
        {groups.map((group) => (
          <section id={`commands-${group.id}`} key={group.id} className="scroll-mt-24">
            <h3 className="text-xl font-semibold">{group.title}</h3>
            {group.note ? <p className="mt-2 max-w-3xl text-sm text-muted">{group.note}</p> : null}
            <ul className="mt-4 grid gap-3 md:grid-cols-2">
              {group.rows.map((item) => (
                <CommandRow key={item.id} item={item} />
              ))}
            </ul>
          </section>
        ))}
      </div>
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
