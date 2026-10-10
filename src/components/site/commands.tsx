import { useEffect, useState } from "react";
import { CopyBurstButton } from "@/components/site/copy-burst";
import { BEDROCK_COMMANDS, COMMANDS } from "@/lib/alpen/content";
import { entries, fbGet } from "@/lib/alpen/staff";

type Row = { cmd: string; text: string };

export function PlayerCommands() {
  const [edition, setEdition] = useState<"java" | "bedrock">("java");
  const [java, setJava] = useState<Row[] | null>(null);
  const [bedrock, setBedrock] = useState<Row[] | null>(null);

  useEffect(() => {
    fbGet<Record<string, { cmd?: string; text?: string }>>("playerCommands/java")
      .then((value) => setJava(entries(value).map(([, item]) => ({ cmd: item.cmd || "", text: item.text || "" })).filter((item) => item.cmd)))
      .catch(() => setJava([]));
    fbGet<Record<string, { cmd?: string; text?: string }>>("playerCommands/bedrock")
      .then((value) => setBedrock(entries(value).map(([, item]) => ({ cmd: item.cmd || "", text: item.text || "" })).filter((item) => item.cmd)))
      .catch(() => setBedrock([]));
  }, []);

  const live = edition === "java" ? java : bedrock;
  const rows = live && live.length ? live : edition === "java" ? COMMANDS : BEDROCK_COMMANDS;

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="kicker">Für alle Spieler</p>
          <h2 className="display mt-2 text-3xl">Befehle</h2>
        </div>
        <div className="edition-switch">
          <button type="button" className={edition === "java" ? "btn-gold" : "btn-ghost"} onClick={() => setEdition("java")}>
            Java
          </button>
          <button type="button" className={edition === "bedrock" ? "btn-gold" : "btn-ghost"} onClick={() => setEdition("bedrock")}>
            Bedrock
          </button>
        </div>
      </div>
      <p className="mt-3 max-w-2xl text-sm text-muted">
        {edition === "java"
          ? "Chat mit T öffnen, Befehl einfügen, Enter."
          : "Chat-Taste drücken. Bedrock-Namen beginnen mit einem Punkt."}
      </p>
      <ul key={edition} className="edition-panel mt-4 grid gap-3 md:grid-cols-2">
        {rows.map((item) => (
          <CommandRow key={item.cmd} cmd={item.cmd} text={item.text} />
        ))}
      </ul>
    </section>
  );
}

function CommandRow({ cmd, text }: { cmd: string; text: string }) {
  return (
    <li className="card card-still flex items-center gap-3 p-4">
      <div className="min-w-0 flex-1">
        <code className="font-semibold text-gold">{cmd}</code>
        <p className="mt-1 text-sm text-muted">{text}</p>
      </div>
      <CopyBurstButton value={cmd} ariaLabel={`${cmd} kopieren`}>
        Kopieren
      </CopyBurstButton>
    </li>
  );
}
