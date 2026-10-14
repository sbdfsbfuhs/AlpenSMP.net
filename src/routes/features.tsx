import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero, Shell } from "@/components/site/shell";
import { ModrinthLink } from "@/components/site/guide/mods";
import { SiteMascot } from "@/components/site/assistant";
import { COMMANDS, FEATURES, TEAM_COMMANDS } from "@/lib/alpen/content";
import { SITE } from "@/lib/alpen/site";

export const Route = createFileRoute("/features")({
  head: () => ({
    meta: [
      { title: "Features & Befehle · AlpenSMP" },
      {
        name: "description",
        content:
          "Claims mit GriefPrevention, Spieler-Teams über /team create, Simple Voice Chat, Homes, TPA, /back und Java-Bedrock-Crossplay auf AlpenSMP.",
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
            <p className="mt-1 text-sm text-brand">{feature.summary}</p>
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
                <code className="font-semibold text-brand">{row.cmd}</code>
                <span className="text-sm text-muted">{row.text}</span>
              </li>
            ))}
          </ul>
          <h3 id="teams" className="mt-12 scroll-mt-24 text-2xl font-semibold">Team-Befehle</h3>
          <p className="mt-3 max-w-2xl text-muted">
            Zuerst <code className="text-brand">/team create Name</code>. Ohne dieses Team gehen Prefix, Team-Home, Warps, Endertruhe und Teamchat nicht.
          </p>
          <ul className="mt-6 divide-y divide-line overflow-hidden rounded-lg border border-line">
            {TEAM_COMMANDS.map((row) => (
              <li key={row.cmd} className="grid gap-1 bg-surface px-5 py-4 sm:grid-cols-[14rem_1fr] sm:items-center">
                <code className="font-semibold text-brand">{row.cmd}</code>
                <span className="text-sm text-muted">{row.text}</span>
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap gap-3">
            <ModrinthLink href={SITE.voiceMod}>Simple Voice Chat auf Modrinth</ModrinthLink>
            <ModrinthLink href={SITE.modrinthApp}>Modrinth App</ModrinthLink>
            <Link to="/guide" hash="mods" className="btn-ghost">
              Mods & Voice
            </Link>
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
