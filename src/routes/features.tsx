import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowDown,
  Compass,
  Home,
  Map,
  Mic,
  PackageCheck,
  RotateCcw,
  Shield,
  Users,
  Waypoints,
} from "lucide-react";
import { PageHero, Shell } from "@/components/site/shell";
import { ModrinthLink } from "@/components/site/guide/mods";
import { SiteMascot } from "@/components/site/assistant";
import { PlayerCommands } from "@/components/site/commands";
import { FEATURES } from "@/lib/alpen/content";
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
  const icons = [Compass, Shield, Mic, PackageCheck, Home, Users, Waypoints, RotateCcw, Map];
  return (
    <Shell>
      <PageHero
        kicker="Features"
        title="Vanilla-Survival mit Komfort"
        lede="Vanilla-Survival mit genau den Komfort-Funktionen, die das gemeinsame Spielen leichter machen – und sonst nichts."
      />
      <section className="shell py-10 md:py-14">
        <div className="mb-6 max-w-2xl">
          <p className="kicker">Übersicht</p>
          <h2 className="display mt-2 text-3xl md:text-4xl">Was dich auf AlpenSMP erwartet</h2>
          <p className="mt-3 text-muted">
            Die wichtigsten Funktionen kompakt. Öffne nur die Details, die du gerade brauchst.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, index) => {
            const Icon = icons[index % icons.length] ?? Compass;
            return (
              <article
                id={feature.id}
                key={feature.id}
                className="card card-still scroll-mt-24 p-5 transition-transform duration-200 hover:-translate-y-0.5 motion-reduce:transition-none"
              >
                <div className="flex items-start gap-3">
                  <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand">
                    <Icon className="size-5" />
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-lg font-semibold">{feature.title}</h3>
                    <p className="mt-1 text-sm text-muted">{feature.summary}</p>
                  </div>
                </div>
                <details className="mt-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-2 text-sm font-medium text-brand [&::-webkit-details-marker]:hidden">
                    Details ansehen <ArrowDown className="size-4" />
                  </summary>
                  <div className="mt-3 space-y-3 border-t border-line pt-3 text-sm text-muted">
                    {feature.body.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                </details>
              </article>
            );
          })}
        </div>
      </section>
      <SiteMascot home="features" bias="stretch" line="Claims, Homes und Voice – frag einfach." />
      <section className="border-y border-line bg-bg-raised py-12 md:py-14">
        <div className="shell">
          <PlayerCommands />
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
            Joinen geht auch ohne Client-Mods. Voice Chat nur, wenn du den Mod installierst. Erlaubt
            sind ausserdem OptiFine, Sodium, Iris, Freecam, Xaero’s Minimap, Shulker-Tooltips,
            Inventory HUD sowie Performance- und Komfort-Mods. Cheats wie X-Ray, Fly oder KillAura
            sind verboten.
          </p>
        </div>
      </section>
    </Shell>
  );
}
