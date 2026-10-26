import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { CopyBurstButton } from "@/components/site/copy-burst";
import { COMMAND_GROUPS, type PlayerCommand } from "@/lib/alpen/content";
import { entries, fbGet } from "@/lib/alpen/staff";

type Row = { cmd: string; text: string };

export function PlayerCommands() {
  const [edition, setEdition] = useState<"java" | "bedrock">("java");
  const [extra, setExtra] = useState<Row[]>([]);

  useEffect(() => {
    const path = edition === "java" ? "playerCommands/java" : "playerCommands/bedrock";
    const known = new Set(COMMAND_GROUPS.flatMap((group) => group.rows.map((row) => row.cmd)));
    fbGet<Record<string, { cmd?: string; text?: string }>>(path)
      .then((value) =>
        setExtra(
          entries(value)
            .map(([, item]) => ({ cmd: item.cmd || "", text: item.text || "" }))
            .filter((item) => item.cmd && !known.has(item.cmd)),
        ),
      )
      .catch(() => setExtra([]));
  }, [edition]);

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="kicker">Für alle Spieler</p>
          <h2 className="display mt-2 text-3xl">Befehle</h2>
        </div>
        <div className="edition-switch">
          <button type="button" className={edition === "java" ? "btn-brand" : "btn-ghost"} onClick={() => setEdition("java")}>
            Java
          </button>
          <button type="button" className={edition === "bedrock" ? "btn-brand" : "btn-ghost"} onClick={() => setEdition("bedrock")}>
            Bedrock
          </button>
        </div>
      </div>
      <p className="mt-3 max-w-2xl text-sm text-muted">
        {edition === "java"
          ? "Chat mit T öffnen, Befehl einfügen, Enter."
          : "Chat-Taste drücken. Namen beginnen mit einem Punkt, zum Beispiel /tpa .Spieler."}
      </p>
      <div className="mt-8 space-y-10">
        {COMMAND_GROUPS.map((group) => (
          <section key={group.id}>
            <h3 className="text-xl font-semibold">{group.title}</h3>
            {group.note ? <p className="mt-2 max-w-3xl text-sm text-muted">{group.note}</p> : null}
            <ul className="mt-4 grid gap-3 md:grid-cols-2">
              {group.rows.map((item) => (
                <CommandRow key={item.cmd} item={item} edition={edition} />
              ))}
            </ul>
          </section>
        ))}
        {extra.length ? (
          <section>
            <h3 className="text-xl font-semibold">Vom Team ergänzt</h3>
            <ul className="mt-4 grid gap-3 md:grid-cols-2">
              {extra.map((item) => (
                <CommandRow key={item.cmd} item={item} edition={edition} />
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </section>
  );
}

function CommandRow({ item, edition }: { item: PlayerCommand; edition: "java" | "bedrock" }) {
  const cmd = edition === "bedrock" ? item.cmd.replaceAll("Spieler", ".Spieler") : item.cmd;
  return (
    <li className="card card-still flex items-center gap-3 p-4">
      <div className="min-w-0 flex-1">
        <code className="font-semibold text-brand">{cmd}</code>
        <p className="mt-1 text-sm text-muted">{item.text}</p>
        {item.href ? (
          <Link to={item.href} className="mt-2 inline-flex text-sm text-brand underline">
            {item.hrefLabel || "Weiter"}
          </Link>
        ) : null}
      </div>
      <CopyBurstButton value={cmd} ariaLabel={`${cmd} kopieren`}>
        Kopieren
      </CopyBurstButton>
    </li>
  );
}