import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity,
  ArrowDown,
  Compass,
  Home,
  Hammer,
  Map,
  Mic,
  PackageCheck,
  RotateCcw,
  Shield,
  ShoppingBag,
  Trophy,
  Users,
  Waypoints,
  type LucideIcon,
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
          "Gemeinsam Survival spielen: Claims, Java-Bedrock-Crossplay, Spieler-Teams, Duelle, Homes, Shops, Voice Chat und praktische Komfortfunktionen.",
      },
    ],
  }),
  component: FeaturesPage,
});

function FeaturesPage() {
  const icons: Record<string, LucideIcon> = {
    survival: Compass,
    claims: Shield,
    voice: Mic,
    graves: PackageCheck,
    homes: Home,
    teams: Users,
    tpa: Waypoints,
    back: RotateCcw,
    crossplay: Map,
    duels: Trophy,
    building: Hammer,
    shops: ShoppingBag,
    activity: Activity,
  };
  const sections = [
    {
      title: "Welt & Schutz",
      description: "Bau dir etwas auf und schütze, was dir wichtig ist.",
    },
    {
      title: "Gemeinsam spielen",
      description: "Triff andere, bilde Teams und spiele plattformübergreifend.",
    },
    {
      title: "Komfort",
      description: "Nützliche Extras für Wege, Bauen und den Alltag.",
    },
  ] as const;
  return (
    <Shell>
      <PageHero
        kicker="Features"
        title="Mehr als nur Survival"
        lede="Eine gemeinsame Welt zum Bauen, Erkunden und Zusammenspielen – mit praktischen Extras, ohne Pay-to-Win."
      />
      <section className="shell py-10 md:py-14">
        <div className="mb-9 flex flex-wrap items-end justify-between gap-5">
          <div className="max-w-2xl">
            <p className="kicker">Dein Spiel, deine Möglichkeiten</p>
            <h2 className="display mt-2 text-3xl md:text-4xl">Was du auf AlpenSMP machen kannst</h2>
            <p className="mt-3 text-muted">
              Die wichtigsten Funktionen auf einen Blick. Öffne Details nur dort, wo du mehr wissen
              möchtest.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs font-medium">
            <span className="rounded-full border border-line bg-surface px-3 py-1.5">
              Java & Bedrock
            </span>
            <span className="rounded-full border border-line bg-surface px-3 py-1.5">
              Voice optional
            </span>
            <span className="rounded-full border border-line bg-surface px-3 py-1.5">
              Ohne Pay-to-Win
            </span>
          </div>
        </div>
        <div className="space-y-12">
          {sections.map((section) => {
            const features = FEATURES.filter((feature) => feature.category === section.title);
            return (
              <section key={section.title} aria-labelledby={`features-${section.title}`}>
                <div className="mb-4 border-l-2 border-brand pl-4">
                  <h3 id={`features-${section.title}`} className="text-xl font-semibold">
                    {section.title}
                  </h3>
                  <p className="mt-1 text-sm text-muted">{section.description}</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {features.map((feature) => {
                    const Icon = icons[feature.id] ?? Compass;
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
                            <h4 className="text-lg font-semibold">{feature.title}</h4>
                            <p className="mt-1 text-sm text-muted">{feature.summary}</p>
                          </div>
                        </div>
                        <details className="mt-4">
                          <summary className="flex cursor-pointer list-none items-center justify-between gap-2 text-sm font-medium text-brand [&::-webkit-details-marker]:hidden">
                            Mehr erfahren <ArrowDown className="size-4" />
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
