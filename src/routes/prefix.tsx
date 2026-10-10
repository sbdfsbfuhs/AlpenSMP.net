import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHero, Shell } from "@/components/site/shell";
import { SiteMascot } from "@/components/site/assistant";
import { CopyIp } from "@/components/site/live";

export const Route = createFileRoute("/prefix")({
  head: () => ({
    meta: [
      { title: "Team-Prefix · AlpenSMP" },
      { name: "description", content: "So setzt du den Team-Prefix: /team prefix, Farbcode und Teamname ohne Leerzeichen. Beides zusammen höchstens 10 Zeichen. Das ist nicht der Spielername." },
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
  const clean = name.replace(/\s+/g, "").slice(0, 8);
  const token = `&${code}${clean}`;
  const command = `/team prefix ${token}`;
  const left = COLORS.filter((_, index) => index < 8);
  const right = COLORS.filter((_, index) => index >= 8);

  return (
    <Shell>
      <PageHero
        kicker="Ingame"
        title="Team-Prefix"
        lede="Das ist der Prefix vom Team, nicht der Spielername. Im Tab steht er direkt vor dem Namen, und der Text selbst ist farbig."
      />
      <div className="shell grid gap-6 py-12 lg:grid-cols-[1fr_0.9fr]">
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
            <p className="mt-1 text-sm text-muted">Nicht der Spielername. Der Farbcode zählt mit. &{code} plus der Team-Text dürfen zusammen 10 Zeichen nicht übersteigen. Keine Leerzeichen.</p>
            <input
              className="field mt-3"
              maxLength={8}
              placeholder="Zum Beispiel Alpen"
              value={name}
              onChange={(event) => setName(event.target.value.replace(/\s+/g, "").slice(0, 8))}
            />
            <p className={`mt-2 text-sm ${token.length >= 10 ? "text-gold" : "text-muted"}`}>
              <code>{token || `&${code}`}</code> · {token.length}/10
            </p>
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
              <CopyIp value={clean ? command : "/team prefix &cAlpen"} label="Befehl kopieren" />
            </div>
            <p className="mt-3 text-sm text-muted">Beispiel: <code className="text-gold">/team prefix &cAlpen</code> · das sind 7 von 10 Zeichen.</p>
          </article>
        </section>
      </div>
      <SiteMascot home="prefix" bias="look" line="Der Team-Prefix. Nicht dein Spielername." />
    </Shell>
  );
}
