import { SITE } from "@/lib/alpen/site";

const LOADERS = ["Fabric", "Forge", "NeoForge", "Quilt"];

const EXTRA = [
  {
    name: "Sodium",
    text: "Mehr Bilder pro Sekunde, ohne am Spiel etwas zu ändern.",
    href: "https://modrinth.com/mod/sodium",
  },
  {
    name: "Iris Shaders",
    text: "Shader, wenn der Rechner das mitmacht.",
    href: "https://modrinth.com/mod/iris",
  },
  {
    name: "Xaero's Minimap",
    text: "Kleine Karte am Rand, damit du den Weg zurück findest.",
    href: "https://modrinth.com/mod/xaeros-minimap",
  },
  {
    name: "Freecam",
    text: "Kamera loslösen und um den Bau schauen, ohne dich zu bewegen.",
    href: "https://modrinth.com/mod/freecam",
  },
  {
    name: "Shulker Box Tooltip",
    text: "Zeigt, was in einer Shulker-Kiste ist, ohne sie zu öffnen.",
    href: "https://modrinth.com/mod/shulkerboxtooltip",
  },
];

export function ModrinthMark() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" />
    </svg>
  );
}

export function ModrinthLink({ href, children }: { href: string; children: string }) {
  return (
    <a className="btn-modrinth" href={href} target="_blank" rel="noopener noreferrer">
      <ModrinthMark />
      {children}
    </a>
  );
}

export function ModsGuide() {
  return (
    <section id="mods" className="scroll-mt-24" aria-labelledby="mods-title">
      <p className="kicker">Java</p>
      <h2 id="mods-title" className="display mt-2 text-4xl">
        🎮 Mods & Voice Chat – So geht's
      </h2>
      <p className="mt-3 max-w-2xl text-muted">Vier Schritte. Mods sind freiwillig. Cheats bleiben verboten.</p>
      <div className="mt-8 space-y-4">
        <article className="card card-still guide-step p-6">
          <span className="guide-step-no" aria-hidden="true">
            01
          </span>
          <div className="guide-step-body">
            <span className="chip-note go">Empfohlen für Anfänger</span>
            <h3 className="mt-3 text-2xl font-semibold">Modrinth App holen</h3>
            <p className="mt-2 max-w-xl text-muted">
              Die Modrinth App ist der einfachste Weg, Mods zu installieren. Kostenlos, sicher, übersichtlich.
            </p>
            <div className="mt-5">
              <ModrinthLink href={SITE.modrinthApp}>Modrinth App herunterladen →</ModrinthLink>
            </div>
          </div>
        </article>

        <article className="card card-still guide-step p-6">
          <span className="guide-step-no" aria-hidden="true">
            02
          </span>
          <div className="guide-step-body">
            <h3 className="text-2xl font-semibold">Simple Voice Chat Mod</h3>
            <p className="mt-2 max-w-xl text-muted">
              Mit diesem Mod kannst du im Spiel mit anderen sprechen – wie ein Walkie-Talkie, je näher desto lauter.
              Optional, du kannst auch ohne joinen.
            </p>
            <ul className="chip-row mt-4" aria-label="Loader">
              {LOADERS.map((loader) => (
                <li key={loader} className="chip-note load">
                  {loader}
                </li>
              ))}
            </ul>
            <p className="chip-note warn mt-4">
              Version passend zu deiner Minecraft-Version wählen – empfohlen: {SITE.version}
            </p>
            <div className="mt-5">
              <ModrinthLink href={SITE.voiceMod}>Auf Modrinth öffnen →</ModrinthLink>
            </div>
          </div>
        </article>

        <article className="card card-still guide-step p-6">
          <span className="guide-step-no" aria-hidden="true">
            03
          </span>
          <div className="guide-step-body">
            <h3 className="text-2xl font-semibold">Weitere empfohlene Mods</h3>
            <p className="mt-2 max-w-xl text-muted">Optional, aber nützlich. Stehen so auch in Regel 3.</p>
            <ul className="mt-2">
              {EXTRA.map((mod) => (
                <li key={mod.href} className="guide-mod">
                  <div className="min-w-0">
                    <p className="font-semibold">{mod.name}</p>
                    <p className="text-sm text-muted">{mod.text}</p>
                  </div>
                  <ModrinthLink href={mod.href}>Modrinth →</ModrinthLink>
                </li>
              ))}
            </ul>
          </div>
        </article>

        <article className="card card-still guide-step p-6">
          <span className="guide-step-no" aria-hidden="true">
            04
          </span>
          <div className="guide-step-body">
            <h3 className="text-2xl font-semibold">Kein Bock auf Mods?</h3>
            <p className="mt-2 max-w-xl text-muted">
              Kein Problem. Du kannst auch ohne jeden Mod auf AlpenSMP spielen. Voice Chat funktioniert dann halt nicht,
              aber alles andere schon.
            </p>
            <div className="mt-5">
              <a className="btn-gold" href="/#join">
                Direkt joinen →
              </a>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
