import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero, Shell } from "@/components/site/shell";
import { SiteMascot } from "@/components/site/assistant";
import { COMMANDS, FEATURES } from "@/lib/alpen/content";
import { SITE } from "@/lib/alpen/site";

export const Route = createFileRoute("/features")({
  head: () => ({
    meta: [
      { title: "Features & Befehle · AlpenSMP" },
      {
        name: "description",
        content:
          "Claims mit GriefPrevention, Simple Voice Chat, Homes, TPA, /back, Todesgräber und Java-Bedrock-Crossplay auf AlpenSMP.",
      },
    ],
  }),
  component: FeaturesPage,
});

function FeaturesPage() {
  return (
    <Shell>
      <PageHero
        kicker="Features"
        title="Was dich erwartet"
        lede="Vanilla-Survival mit genau den Komfort-Funktionen, die das gemeinsame Spielen leichter machen – und sonst nichts."
      />
      <div className="shell grid gap-4 py-12 md:grid-cols-2">
        {FEATURES.map((feature) => (
          <article id={feature.id} key={feature.id} className="card scroll-mt-24 p-6">
            <h2 className="text-xl font-semibold">{feature.title}</h2>
            <p className="mt-1 text-sm text-gold">{feature.summary}</p>
            <div className="mt-4 space-y-3 text-sm text-muted">
              {feature.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </article>
        ))}
      </div>
      <SiteMascot home="features" bias="stretch" line="Claims, Homes und Voice – frag einfach." />
      <section className="border-t border-line bg-bg-raised py-14">
        <div className="shell">
          <p className="kicker">Befehle</p>
          <h2 className="display mt-3 text-4xl">Wichtige Commands</h2>
          <p className="mt-3 max-w-2xl text-muted">Nur Befehle, die auf AlpenSMP bestätigt sind.</p>
          <ul className="mt-8 divide-y divide-line overflow-hidden rounded-lg border border-line">
            {COMMANDS.map((row) => (
              <li key={row.cmd} className="grid gap-1 bg-surface px-5 py-4 sm:grid-cols-[9rem_1fr] sm:items-center">
                <code className="font-semibold text-gold">{row.cmd}</code>
                <span className="text-sm text-muted">{row.text}</span>
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap gap-3">
            <a className="btn-gold" href={SITE.voiceMod} target="_blank" rel="noreferrer">
              Simple Voice Chat auf Modrinth
            </a>
            <a className="btn-ghost" href={SITE.modrinthApp} target="_blank" rel="noreferrer">
              Modrinth App
            </a>
            <Link to="/prefix" className="btn-ghost">
              Team-Prefix setzen
            </Link>
          </div>
          <p className="mt-4 max-w-2xl text-sm text-muted">
            Joinen geht auch ohne Client-Mods. Voice Chat nur, wenn du den Mod installierst. Erlaubt sind ausserdem
            OptiFine, Sodium, Iris, Freecam, Xaero’s Minimap, Shulker-Tooltips, Inventory HUD sowie Performance- und
            Komfort-Mods. Cheats wie X-Ray, Fly oder KillAura sind verboten.
          </p>
        </div>
      </section>
    </Shell>
  );
}
