import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHero, Shell } from "@/components/site/shell";
import { SiteMascot } from "@/components/site/assistant";
import { CopyIp } from "@/components/site/live";
import { TEAM_BLOCKED } from "@/lib/alpen/content";

export const Route = createFileRoute("/prefix")({
  head: () => ({
    meta: [
      { title: "Team-Prefix · AlpenSMP" },
      { name: "description", content: "Team-Prefix nur nach /team create. Danach /team prefix, Farbcode und Buchstaben, zusammen 3 bis 10 Zeichen. Ohne Team geht der Befehl nicht." },
    ],
  }),
  component: PrefixPage,
});

const COLORS: { code: string; hex: string; ink: string; name: string }[] = [
  { code: "4", hex: "#AA0000", ink: "#fff", name: "Dunkelrot" },
  { code: "c", hex: "#FF5555", ink: "#1a0508", name: "Rot" },
  { code: "6", hex: "#FFAA00", ink: "#1a0508", name: "Orange" },
  { code: "e", hex: "#FFFF55", ink: "#1a0508", name: "Gelb" },
  { code: "2", hex: "#00AA00", ink: "#fff", name: "Dunkelgrün" },
  { code: "a", hex: "#55FF55", ink: "#1a0508", name: "Grün" },
  { code: "b", hex: "#55FFFF", ink: "#1a0508", name: "Hellblau" },
  { code: "3", hex: "#00AAAA", ink: "#fff", name: "Türkis" },
  { code: "1", hex: "#0000AA", ink: "#fff", name: "Dunkelblau" },
  { code: "9", hex: "#5555FF", ink: "#fff", name: "Blau" },
  { code: "d", hex: "#FF55FF", ink: "#1a0508", name: "Pink" },
  { code: "5", hex: "#AA00AA", ink: "#fff", name: "Lila" },
  { code: "7", hex: "#AAAAAA", ink: "#1a0508", name: "Grau" },
  { code: "8", hex: "#555555", ink: "#fff", name: "Dunkelgrau" },
  { code: "0", hex: "#000000", ink: "#fff", name: "Schwarz" },
  { code: "f", hex: "#FFFFFF", ink: "#1a0508", name: "Weiss" },
];

function PrefixPage() {
  const [code, setCode] = useState("c");
  const [name, setName] = useState("Alpen");
  const color = COLORS.find((item) => item.code === code) ?? COLORS[1];
  const clean = name.replace(/[^a-zA-Z]/g, "").slice(0, 8);
  const token = `&${code}${clean}`;
  const command = `/team prefix ${token}`;
  const blocked = TEAM_BLOCKED.some((tag) => tag.toLowerCase() === clean.toLowerCase());
  const prefixOk = clean.length > 0 && token.length >= 3 && token.length <= 10 && !blocked;
  const createOk = clean.length >= 3 && clean.length <= 10 && !blocked;
  const left = COLORS.filter((_, index) => index < 8);
  const right = COLORS.filter((_, index) => index >= 8);

  return (
    <Shell>
      <PageHero
        kicker="Ingame"
        title="Team-Prefix"
        lede="Der Prefix gehört zum Team, nicht zum Spielernamen. Ohne Team, also ohne /team create, funktioniert /team prefix nicht."
      />
      <div className="shell py-12">
        <section className="card card-still p-5">
          <p className="kicker">Zuerst</p>
          <h2 className="mt-2 text-lg font-semibold">Ohne Team geht das nicht</h2>
          <p className="mt-2 text-sm text-muted">
            <code className="text-brand">/team prefix</code> ändert den Prefix nur von einem Team, das es schon gibt.
            Bist du in keinem, kommt nichts an. Dasselbe gilt für Team-Home, Warps, die Endertruhe, <code className="text-brand">/tc</code> und <code className="text-brand">/team pvp</code>.
          </p>
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-muted">
            <li>
              Team anlegen: <code className="text-brand">/team create Name</code>. 3 bis 10 Buchstaben, nur a bis z, kein Farbcode, keine Leerzeichen.
              Gesperrt: {TEAM_BLOCKED.join(", ")}. Kostenlos, höchstens 20 Mitglieder.
            </li>
            <li>
              Danach der Prefix: ein Farbcode und danach nur Buchstaben. Beides zusammen 3 bis 10 Zeichen.
              Beispiel <code className="text-brand">/team prefix &cAlpen</code>.
            </li>
          </ol>
          <p className="mt-3 text-sm text-muted">
            Im Tab steht der Prefix vor dem Namen, farbig ist nur dieser Text. Im Chat folgt danach ein Leerzeichen, ohne Klammern.
          </p>
        </section>
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <section className="card card-still p-5">
          <h2 className="text-lg font-semibold">1. Farbe wählen</h2>
          <p className="mt-1 text-sm text-muted">Das sind die Minecraft-Codes. Antippen, nicht abtippen.</p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {[left, right].map((column) => (
              <div key={column[0].code} className="space-y-2">
                {column.map((item) => (
                  <button
                    key={item.code}
                    type="button"
                    className="w-full rounded-full border-2 px-4 py-3 text-center text-sm font-bold"
                    style={{
                      background: item.hex,
                      color: item.ink,
                      borderColor: item.code === code ? "#fff" : "#111",
                    }}
                    onClick={() => setCode(item.code)}
                  >
                    &{item.code}
                    <span className="ml-2 font-medium opacity-80">{item.name}</span>
                  </button>
                ))}
              </div>
            ))}
          </div>
        </section>
        <section className="space-y-4">
          <article className="card card-still p-5">
            <h2 className="text-lg font-semibold">2. Team-Prefix</h2>
            <p className="mt-1 text-sm text-muted">Nicht der Spielername. Ein Farbcode am Anfang, danach nur Buchstaben. Zusammen 3 bis 10 Zeichen.</p>
            <input
              className="field mt-3"
              maxLength={8}
              placeholder="Zum Beispiel Alpen"
              value={name}
              onChange={(event) => setName(event.target.value.replace(/[^a-zA-Z]/g, "").slice(0, 8))}
            />
            <p className={`mt-2 text-sm ${!prefixOk ? "text-brand" : "text-muted"}`}>
              <code>{token || `&${code}`}</code> · {token.length}/10
              {clean.length === 0 ? " · mindestens ein Buchstabe" : ""}
              {blocked ? " · dieser Name ist gesperrt" : ""}
            </p>
            {createOk ? (
              <p className="mt-2 text-sm text-muted">
                Team dazu, falls du noch keins hast: <code className="text-brand">/team create {clean}</code>
              </p>
            ) : (
              <p className="mt-2 text-sm text-muted">Für /team create brauchst du 3 bis 10 Buchstaben. Der Prefix darf mit Farbcode kürzer wirken, der Teamname nicht.</p>
            )}
          </article>
          <article className="card card-still p-5">
            <h2 className="text-lg font-semibold">3. So siehst du den Team-Prefix im Tab</h2>
            <div className="mc-tab" aria-label="Vorschau der Tab-Liste">
              <p className="dim">Steve</p>
              <p>
                <span style={{ color: color.hex }}>{clean || "Team"}</span>
                <span className="player">Spieler</span>
              </p>
              <p className="dim">Alex</p>
            </div>
            <p className="mt-4 text-sm text-muted">Farbig ist nur der Team-Prefix. Der Spielername dahinter bleibt weiss und zählt nicht zu den 10 Zeichen.</p>
            <div className="mt-3">
              <CopyIp value={prefixOk ? command : "/team prefix &cAlpen"} label="Prefix kopieren" />
            </div>
            {createOk ? (
              <div className="mt-3">
                <CopyIp value={`/team create ${clean}`} label="Team anlegen kopieren" />
              </div>
            ) : null}
            <p className="mt-3 text-sm text-muted">
              Beispiel: <code className="text-brand">/team prefix &cAlpen</code> · das sind 7 von 10 Zeichen. Ohne vorheriges <code className="text-brand">/team create</code> setzt der Befehl nichts.
            </p>
          </article>
        </section>
        </div>
      </div>
      <SiteMascot home="prefix" bias="look" line="Erst /team create. Sonst geht der Prefix nicht." />
    </Shell>
  );
}
