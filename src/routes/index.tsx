import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, Compass, Map, Mic, Shield, Sparkles, Users } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { DiscordLink, Shell, TikTokLink } from "@/components/site/shell";
import { ModrinthLink } from "@/components/site/guide/mods";
import { SiteMascot } from "@/components/site/assistant";
import { CopyIp, MotdNotice, PlayerChart, StatStrip, StatusCard } from "@/components/site/live";
import { FEATURES, PILLARS } from "@/lib/alpen/content";
import { SITE } from "@/lib/alpen/site";

export const Route = createFileRoute("/")({
  component: Home,
});

function useHeroParallax() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const mobile = window.matchMedia("(max-width: 760px)");
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const y = mobile.matches ? 0 : Math.min(window.scrollY, 520) * 0.25;
        el.style.setProperty("--parallax", `${y}px`);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    mobile.addEventListener("change", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      mobile.removeEventListener("change", onScroll);
    };
  }, []);
  return ref;
}

type Sky = "morning" | "day" | "evening" | "night";

function skyOf(date = new Date()): Sky {
  const hour = date.getHours();
  if (hour >= 5 && hour < 10) return "morning";
  if (hour >= 10 && hour < 16) return "day";
  if (hour >= 16 && hour < 21) return "evening";
  return "night";
}

function useSky() {
  const [sky, setSky] = useState<Sky | "">("");
  useEffect(() => {
    const tick = () => setSky(skyOf());
    tick();
    const id = window.setInterval(tick, 60_000);
    return () => window.clearInterval(id);
  }, []);
  return sky;
}

function SeasonBadge() {
  const [label, setLabel] = useState("");
  useEffect(() => {
    const read = () => setLabel(document.documentElement.dataset.seasonLabel || "");
    read();
    window.addEventListener("alpen-season", read);
    return () => window.removeEventListener("alpen-season", read);
  }, []);
  if (!label) return null;
  return <p className="season-badge">{label}</p>;
}

function Home() {
  const hero = useHeroParallax();
  const sky = useSky();
  const [statsOpen, setStatsOpen] = useState(false);
  return (
    <Shell>
      <section className="hero-sky home-hero relative overflow-hidden border-b border-line" data-sky={sky || undefined}>
        <div ref={hero} className="hero-parallax">
          <img
            src="/media/ridge.jpg"
            alt="Abendlicht über einem Alpenkamm und Fichtenwald"
            className="hero-drift tone-red absolute inset-0 h-full w-full object-cover opacity-75"
            fetchPriority="high"
            decoding="async"
          />
          <div className="sky-wash" />
          {sky === "night" ? (
            <div className="sky-night" aria-hidden="true">
              <span className="sky-moon" />
              <span className="sky-stars">
                {Array.from({ length: 16 }, (_, i) => (
                  <i key={i} className="sky-star" />
                ))}
              </span>
            </div>
          ) : sky ? (
            <span className="sky-sun" aria-hidden="true" />
          ) : null}
        </div>
        <div className="hero-read" />
        <div className="shell relative z-[3] hero-layout home-hero-layout">
          <div className="home-hero-copy">
            <p className="kicker">Deutschsprachiger Minecraft Survival Server</p>
            <SeasonBadge />
            <h1 className="display mt-3 text-6xl text-fg md:text-8xl">
              Alpen<span className="text-brand">SMP</span>
            </h1>
            <p className="display mt-4 max-w-2xl text-2xl text-fg italic md:text-3xl">
              Vanilla Survival. Faire Community. Persönliche Serverleitung.
            </p>
            <p className="mt-4 max-w-xl text-base text-muted md:text-lg">Eine Welt für Java und Bedrock. Kostenlos und ohne Pay-to-Win.</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/server" className="btn-brand">
                So spielst du mit <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="shell home-live-section">
        <MotdNotice />
        <StatusCard compact />
      </section>

      <section className="shell py-14 md:py-16">
        <div className="max-w-2xl">
          <p className="kicker">Über AlpenSMP</p>
          <h2 className="display mt-3 text-3xl md:text-4xl">Einfach Minecraft spielen – fair und gemeinsam.</h2>
          <p className="mt-4 text-muted">
            Eine gemeinsame Survival-Welt mit fairer, deutschsprachiger Community. Keine Pay-to-Win-Mechaniken, keine
            überladenen Plugins – nur Minecraft, so wie es gedacht ist.
          </p>
        </div>
        <div className="stagger mt-8 grid gap-4 md:grid-cols-3">
          {PILLARS.map((item) => (
            <article key={item.title} className="card p-5">
              <h3 className="text-lg font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm text-muted">{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <SiteMascot home="index" line="Frag mich nach der IP oder den Regeln." />

      <section className="border-y border-line bg-bg-raised py-14 md:py-16">
        <div className="shell">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="kicker">Auf dem Server</p>
              <h2 className="display mt-3 text-3xl md:text-4xl">Das Wichtigste auf einen Blick</h2>
            </div>
            <Link to="/features" className="btn-ghost">
              Alle Features ansehen <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="stagger mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.filter((feature) => ["survival", "claims", "voice", "graves"].includes(feature.id)).map((feature) => (
              <Link key={feature.id} to="/features" hash={feature.id} className="card p-4 hover:border-brand/50">
                <Sparkles className="size-4 text-brand" />
                <h3 className="mt-2 font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted">{feature.summary}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-ice">Mehr erfahren <ArrowRight className="size-3" /></span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="entdecken" className="shell scroll-mt-24 py-14 md:py-16">
        <div className="max-w-2xl">
          <p className="kicker">Auf der Website</p>
          <h2 className="display mt-3 text-3xl md:text-4xl">Was möchtest du finden?</h2>
          <p className="mt-3 text-muted">Die wichtigsten Infos und Werkzeuge – direkt an einem Ort.</p>
        </div>
        <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Link to="/guide" className="card home-discovery-card p-5">
            <BookOpen className="size-5 text-brand" />
            <h3 className="mt-3 font-semibold">Guide & Befehle</h3>
            <p className="mt-2 text-sm text-muted">Einstieg, Claims, Teams und hilfreiche Befehle.</p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-ice">Zum Guide <ArrowRight className="size-4" /></span>
          </Link>
          <Link to="/regeln" className="card home-discovery-card p-5">
            <Shield className="size-5 text-brand" />
            <h3 className="mt-3 font-semibold">Regeln</h3>
            <p className="mt-2 text-sm text-muted">Alles für ein faires Miteinander auf dem Server.</p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-ice">Regeln lesen <ArrowRight className="size-4" /></span>
          </Link>
          <Link to="/community" className="card home-discovery-card p-5">
            <Users className="size-5 text-brand" />
            <h3 className="mt-3 font-semibold">Community & Events</h3>
            <p className="mt-2 text-sm text-muted">Discord, Neuigkeiten, Aktionen und gemeinsame Projekte.</p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-ice">Community entdecken <ArrowRight className="size-4" /></span>
          </Link>
          <Link to="/server" className="card home-discovery-card p-5">
            <Compass className="size-5 text-brand" />
            <h3 className="mt-3 font-semibold">Server & Beitritt</h3>
            <p className="mt-2 text-sm text-muted">Live-Status, Version sowie alle Schritte zum Mitspielen.</p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-ice">Server ansehen <ArrowRight className="size-4" /></span>
          </Link>
        </div>
      </section>

      <section className="border-y border-line bg-bg-raised py-12 md:py-14">
        <div className="shell">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="kicker">Live vom Server</p>
              <h2 className="display mt-3 text-3xl md:text-4xl">AlpenSMP gerade jetzt</h2>
              <p className="mt-2 text-sm text-muted">Spielerzahlen und Community-Statistiken – nur wenn du sie ansehen möchtest.</p>
            </div>
            <details className="home-stats-disclosure" open={statsOpen} onToggle={(event) => setStatsOpen(event.currentTarget.open)}>
              <summary>{statsOpen ? "Statistiken ausblenden" : "Statistiken anzeigen"}</summary>
              {statsOpen ? (
                <div className="mt-5 space-y-4">
                  <StatStrip />
                  <PlayerChart />
                </div>
              ) : null}
            </details>
          </div>
        </div>
      </section>

      <section id="join" className="shell scroll-mt-24 grid gap-4 py-14 md:py-16 lg:grid-cols-3">
        <article className="card overflow-hidden lg:col-span-2">
          <img src="/media/lichen.jpg" alt="Fichten und Flechten im Alpenwald" className="tone-red h-44 w-full object-cover" loading="lazy" decoding="async" />
          <div className="grid gap-6 p-6 md:grid-cols-2">
            <div>
              <div className="flex items-center gap-2 text-brand">
                <Shield className="size-4" />
                <h3 className="font-semibold text-fg">Java Edition</h3>
              </div>
              <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-muted">
                <li>Minecraft Java öffnen</li>
                <li>Mehrspieler, Server hinzufügen</li>
                <li>Adresse eintragen, Port leer lassen</li>
                <li>Beitreten</li>
              </ol>
              <p className="mt-3 text-sm text-muted">
                Der SRV-Eintrag schickt den Client auf {SITE.play}, Port {SITE.javaPort}.
              </p>
              <div className="mt-4">
                <CopyIp value={SITE.ip} label="Java" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 text-brand">
                <Map className="size-4" />
                <h3 className="font-semibold text-fg">Bedrock Edition</h3>
              </div>
              <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-muted">
                <li>Minecraft Bedrock öffnen</li>
                <li>Server hinzufügen</li>
                <li>Adresse und Port eintragen</li>
                <li>Beitreten</li>
              </ol>
              <p className="mt-3 text-sm text-muted">Bedrock ignoriert den SRV-Eintrag.</p>
              <div className="mt-4 space-y-2">
                <CopyIp value={SITE.play} label="Bedrock" />
                <CopyIp value={SITE.bedrockPort} label="Port" />
              </div>
            </div>
          </div>
        </article>
        <article id="mods" className="card scroll-mt-24 p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-ice/10 text-ice">
              <Mic className="size-5" />
            </span>
            <div>
              <p className="kicker">Mehr entdecken</p>
              <h3 className="text-xl font-semibold text-fg">Voice, Karte & Community</h3>
            </div>
          </div>

          <section className="mt-5 border-t border-line pt-5" aria-labelledby="home-voice-title">
            <div className="flex items-center gap-2 text-brand">
              <Mic className="size-4" />
              <h4 id="home-voice-title" className="font-semibold text-fg">Voice Chat & Mods</h4>
              <span className="rounded-full bg-surface px-2 py-0.5 text-xs text-muted">optional</span>
            </div>
            <p className="mt-2 text-sm text-muted">
              Simple Voice Chat ist freiwillig. Du kannst auch ohne Mods auf dem Server spielen.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link to="/guide" hash="mods" className="btn-ghost">
                Mods & Voice erklärt <ArrowRight className="size-4" />
              </Link>
              <ModrinthLink href={SITE.modrinthApp}>Modrinth App</ModrinthLink>
            </div>
          </section>

          <section className="mt-5 border-t border-line pt-5" aria-labelledby="home-map-title">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-brand">
                <Map className="size-4" />
                <h4 id="home-map-title" className="font-semibold text-fg">Live-Karte</h4>
              </div>
              <span className="rounded-full border border-ember/30 bg-ember/10 px-2.5 py-1 text-xs font-medium text-fg">
                Vorübergehend geschlossen
              </span>
            </div>
            <p className="mt-2 text-sm text-muted">
              Die Karte der Hauptwelt ist pausiert, weil der verfügbare Speicher voll ist.
            </p>
            <Link to="/karte" className="btn-ghost mt-3">
              Kartenstatus ansehen <ArrowRight className="size-4" />
            </Link>
          </section>

          <section className="mt-5 border-t border-line pt-5" aria-labelledby="home-community-title">
            <div className="flex items-center gap-2 text-brand">
              <Users className="size-4" />
              <h4 id="home-community-title" className="font-semibold text-fg">Community & Updates</h4>
            </div>
            <p className="mt-2 text-sm text-muted">
              Support und Neuigkeiten im Discord, Clips und Einblicke auf TikTok {SITE.tiktokHandle}.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <DiscordLink>Discord beitreten</DiscordLink>
              <TikTokLink />
            </div>
          </section>
        </article>
      </section>
    </Shell>
  );
}
