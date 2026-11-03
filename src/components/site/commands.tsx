import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { CopyBurstButton } from "@/components/site/copy-burst";
import { COMMAND_GROUPS, type PlayerCommand } from "@/lib/alpen/content";
import { entries, fbGet } from "@/lib/alpen/staff";

type Row = { cmd: string; text: string };

export function PlayerCommands() {
  const [extra, setExtra] = useState<{ java: Row[]; bedrock: Row[] }>({ java: [], bedrock: [] });

  useEffect(() => {
    const known = new Set(COMMAND_GROUPS.flatMap((group) => group.rows.map((row) => row.cmd)));
    Promise.all([
      fbGet<Record<string, { cmd?: string; text?: string }>>("playerCommands/java").catch(() => null),
      fbGet<Record<string, { cmd?: string; text?: string }>>("playerCommands/bedrock").catch(() => null),
    ]).then(([java, bedrock]) => {
      const read = (value: Record<string, { cmd?: string; text?: string }> | null) =>
        entries(value)
          .map(([, item]) => ({ cmd: item.cmd || "", text: item.text || "" }))
          .filter((item) => item.cmd && !known.has(item.cmd));
      setExtra({ java: read(java), bedrock: read(bedrock) });
    });
  }, []);

  return (
    <section>
      <p className="kicker">Für alle Spieler</p>
      <h2 className="display mt-2 text-3xl">Befehle</h2>
      <p className="mt-3 max-w-2xl text-sm text-muted">Java und Bedrock stehen direkt nebeneinander. Java: Chat mit T. Bedrock: Chat-Taste, Namen mit einem Punkt, zum Beispiel /tpa .Spieler.</p>
      <div className="mt-8 space-y-10">
        {COMMAND_GROUPS.map((group) => (
          <section key={group.id}>
            <h3 className="text-xl font-semibold">{group.title}</h3>
            {group.note ? <p className="mt-2 max-w-3xl text-sm text-muted">{group.note}</p> : null}
            <ul className="mt-4 grid gap-3 md:grid-cols-2">
              {group.rows.map((item) => (
                <CommandRow key={item.cmd} item={item} />
              ))}
            </ul>
          </section>
        ))}
        {extra.java.length || extra.bedrock.length ? (
          <section>
            <h3 className="text-xl font-semibold">Vom Team ergänzt</h3>
            <ul className="mt-4 grid gap-3 md:grid-cols-2">
              {extra.java.map((item) => (
                <CommandRow key={`j-${item.cmd}`} item={item} />
              ))}
              {extra.bedrock
                .filter((item) => !extra.java.some((row) => row.cmd === item.cmd))
                .map((item) => (
                  <CommandRow key={`b-${item.cmd}`} item={{ ...item, cmd: item.cmd.replaceAll(".Spieler", "Spieler") }} bedrockCmd={item.cmd} />
                ))}
            </ul>
          </section>
        ) : null}
      </div>
    </section>
  );
}

function CommandRow({ item, bedrockCmd }: { item: PlayerCommand; bedrockCmd?: string }) {
  const java = item.cmd;
  const bedrock = bedrockCmd || item.cmd.replaceAll("Spieler", ".Spieler");
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
          <div className="flex items-center gap-3">
            <span className="w-16 shrink-0 text-xs text-faint">Java</span>
            <code className="min-w-0 flex-1 font-semibold text-brand">{java}</code>
            <CopyBurstButton value={java} ariaLabel={`${java} kopieren`}>
              Kopieren
            </CopyBurstButton>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-16 shrink-0 text-xs text-faint">Bedrock</span>
            <code className="min-w-0 flex-1 font-semibold text-brand">{bedrock}</code>
            <CopyBurstButton value={bedrock} ariaLabel={`${bedrock} kopieren`}>
              Kopieren
            </CopyBurstButton>
          </div>
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