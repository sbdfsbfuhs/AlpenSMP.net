import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHero, Shell } from "@/components/site/shell";
import { SiteMascot } from "@/components/site/assistant";
import { CopyIp } from "@/components/site/live";
import { TEAM_BLOCKED } from "@/lib/alpen/content";

export const Route = createFileRoute("/prefix")({
  head: () => ({
    meta: [
      { title: "Team erstellen · AlpenSMP" },
      { name: "description", content: "Erstelle dein Team mit /team create und gestalte anschliessend den farbigen Team-Prefix mit Vorschau und fertigen Befehlen." },
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
  const [teamName, setTeamName] = useState("Alpen");
  const color = COLORS.find((item) => item.code === code) ?? COLORS[1];
  const clean = name.replace(/[^a-zA-Z]/g, "").slice(0, 8);
  const cleanTeamName = teamName.replace(/[^a-zA-Z]/g, "").slice(0, 10);
  const token = `&${code}${clean}`;
  const command = `/team prefix ${token}`;
  const blocked = TEAM_BLOCKED.some((tag) => tag.toLowerCase() === cleanTeamName.toLowerCase());
  const prefixOk = clean.length > 0 && token.length >= 3 && token.length <= 10;
  const createOk = cleanTeamName.length >= 3 && cleanTeamName.length <= 10 && !blocked;
  const left = COLORS.filter((_, index) => index < 8);
  const right = COLORS.filter((_, index) => index >= 8);

  return (
    <Shell>
      <PageHero
        kicker="Ingame"
        title="Wie erstelle ich ein Team auf dem Server?"
        lede="Lege zuerst dein Team an. Danach kannst du einen farbigen Prefix gestalten – mit Vorschau und fertigen Befehlen zum Kopieren."
      />
      <div className="shell py-12">
        <section className="card card-still p-5">
          <p className="kicker">Schritt 1</p>
          <h2 className="mt-2 text-lg font-semibold">Team anlegen</h2>
          <p className="mt-2 text-sm text-muted">
            Wähle einen Namen mit 3 bis 10 Buchstaben (a bis z). Keine Leerzeichen oder Farbcodes. Gesperrt sind {TEAM_BLOCKED.join(", ")}. Ein Team ist kostenlos und kann höchstens 20 Mitglieder haben.
          </p>
          <label className="mt-4 block text-sm font-medium" htmlFor="team-name">Dein Teamname</label>
          <input
            id="team-name"
            className="field mt-2"
            maxLength={10}
            placeholder="Zum Beispiel Alpen"
            value={teamName}
            onChange={(event) => setTeamName(event.target.value.replace(/[^a-zA-Z]/g, "").slice(0, 10))}
          />
          <p className={`mt-2 text-sm ${!createOk ? "text-brand" : "text-muted"}`}>
            {cleanTeamName.length}/10 Buchstaben
            {cleanTeamName.length < 3 ? " · mindestens 3 Buchstaben" : ""}
            {blocked ? " · dieser Teamname ist gesperrt" : ""}
          </p>
          {createOk ? (
            <div className="mt-3">
              <CopyIp value={`/team create ${cleanTeamName}`} label="Team anlegen kopieren" />
            </div>
          ) : null}
        </section>
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <section className="card card-still p-5">
          <p className="kicker">Schritt 2</p>
          <h2 className="mt-2 text-lg font-semibold">Farbe für deinen Prefix wählen</h2>
          <p className="mt-1 text-sm text-muted">Das sind die Minecraft-Codes. Antippen, nicht abtippen.</p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {[left, right].map((column) => (
              <div key={column[0].code} className="space-y-2">
                {column.map((item) => (
                  <button
                    key={item.code}
                    type="button"
                    className="w-full rounded-full border-2 px-4 py-3 text-center text-sm font-bold"
                    aria-pressed={item.code === code}
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
            <p className="kicker">Schritt 3</p>
            <h2 className="mt-2 text-lg font-semibold">Prefix gestalten</h2>
            <p className="mt-1 text-sm text-muted">Nicht der Spielername. Ein Farbcode am Anfang, danach nur Buchstaben. Zusammen 3 bis 10 Zeichen.</p>
            <label className="mt-3 block text-sm font-medium" htmlFor="team-prefix">Prefix-Text</label>
            <input
              id="team-prefix"
              className="field mt-3"
              maxLength={8}
              placeholder="Zum Beispiel Alpen"
              value={name}
              onChange={(event) => setName(event.target.value.replace(/[^a-zA-Z]/g, "").slice(0, 8))}
            />
            <p className={`mt-2 text-sm ${!prefixOk ? "text-brand" : "text-muted"}`}>
              <code>{token || `&${code}`}</code> · {token.length}/10
              {clean.length === 0 ? " · mindestens ein Buchstabe" : ""}
            </p>
            <p className="mt-2 text-sm text-muted">Der Prefix gehört zum Team und wird vor dem Spielernamen angezeigt. Farbcode und Buchstaben dürfen zusammen höchstens 10 Zeichen haben.</p>
          </article>
          <article className="card card-still p-5">
            <h2 className="text-lg font-semibold">Vorschau im Tab</h2>
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
              {prefixOk ? <CopyIp value={command} label="Prefix kopieren" /> : <p className="text-sm text-brand">Gib mindestens einen Buchstaben für den Prefix ein.</p>}
            </div>
            <p className="mt-3 text-sm text-muted">
              Beispiel: <code className="text-brand">/team prefix &cAlpen</code> · 7 von 10 Zeichen. Der Befehl funktioniert erst, wenn du dein Team angelegt hast.
            </p>
          </article>
        </section>
        </div>
      </div>
      <SiteMascot home="prefix" bias="look" line="Wähle erst deinen Teamnamen. Danach gestalten wir den Prefix zusammen." />
    </Shell>
  );
}
