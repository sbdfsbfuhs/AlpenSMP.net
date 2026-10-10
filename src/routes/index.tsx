import { createFileRoute, Link } from "@tanstack/react-router";
import { Map, Mic, Shield, Sparkles } from "lucide-react";
import { useEffect, useRef, useState, type RefObject } from "react";
import { DiscordLink, Shell, TikTokLink } from "@/components/site/shell";
import { SiteMascot } from "@/components/site/assistant";
import { CopyIp, MotdNotice, PlayerChart, SiteBanner, StatStrip, StatusCard } from "@/components/site/live";
import { FEATURES, PILLARS, REVIEWS } from "@/lib/alpen/content";
import { SITE } from "@/lib/alpen/site";

export const Route = createFileRoute("/")({
  component: Home,
});

function useHeroParallax() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const y = Math.min(window.scrollY, 520) * 0.16;
        el.style.setProperty("--parallax", `${y}px`);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
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

function useTorch(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!fine.matches || reduce.matches) return;
    root.dataset.torch = "on";
    const sparks = Array.from(root.querySelectorAll<HTMLElement>(".torch-spark"));
    let index = 0;
    let frame = 0;
    let px = -1;
    let py = -1;
    const onMove = (event: PointerEvent) => {
      const box = root.getBoundingClientRect();
      const x = event.clientX - box.left;
      const y = event.clientY - box.top;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        root.style.setProperty("--mx", `${x}px`);
        root.style.setProperty("--my", `${y}px`);
        if (px >= 0 && Math.hypot(x - px, y - py) > 12 && sparks.length) {
          const spark = sparks[index % sparks.length];
          index += 1;
          spark.style.setProperty("--sx", `${x}px`);
          spark.style.setProperty("--sy", `${y}px`);
          spark.style.setProperty("--drift", `${(Math.random() - 0.5) * 16}px`);
          spark.classList.remove("lit");
          void spark.offsetWidth;
          spark.classList.add("lit");
        }
        px = x;
        py = y;
      });
    };
    const onLeave = () => {
      root.style.setProperty("--mx", "-30%");
      root.style.setProperty("--my", "-30%");
    };
    root.addEventListener("pointermove", onMove);
    root.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(frame);
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerleave", onLeave);
      delete root.dataset.torch;
    };
  }, [ref]);
}

function Home() {
  const hero = useHeroParallax();
  const stage = useRef<HTMLElement>(null);
  const sky = useSky();
  useTorch(stage);
  return (
    <Shell>
      <section ref={stage} className="hero-sky relative overflow-hidden border-b border-line" data-sky={sky || undefined}>
        <div ref={hero} className="hero-parallax">
          <img
            src="/media/ridge.jpg"
            alt="Abendlicht über einem Alpenkamm und Fichtenwald"
            className="hero-drift tone-red absolute inset-0 h-full w-full object-cover opacity-55"
          />
        </div>
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
        <div className="torch-layer" aria-hidden="true">
          <span className="torch-shade" />
          {Array.from({ length: 12 }, (_, i) => (
            <i key={i} className="torch-spark" />
          ))}
        </div>
        <div className="hero-read" />
        <div className="shell relative z-[3] grid items-end gap-10 py-16 md:grid-cols-[1.3fr_0.7fr] md:py-24">
          <div>
            <p className="kicker">Deutschsprachiger Minecraft Survival Server</p>
            <h1 className="display mt-4 text-5xl text-fg md:text-7xl">
              Alpen<span className="text-gold">SMP</span>
            </h1>
            <p className="display mt-5 max-w-xl text-2xl text-fg italic md:text-3xl">
              Vanilla Survival. Faire Community. Persönliche Serverleitung.
            </p>
            <p className="mt-5 max-w-xl text-lg text-muted">
              Gemeinsame Survival-Welt mit Claims und Simple Voice Chat – für Java und Bedrock. Kein Pay-to-Win,
              keine überladenen Plugins.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/server" className="btn-gold">
                Jetzt spielen
              </Link>
              <Link to="/regeln" className="btn-ghost">
                Server-Regeln
              </Link>
              <DiscordLink>Discord</DiscordLink>
              <TikTokLink>TikTok</TikTokLink>
            </div>
          </div>
          <StatusCard />
        </div>
      </section>

      <section className="border-b border-line bg-black">
        <div className="shell grid gap-2 py-4 sm:grid-cols-3 lg:grid-cols-6">
          {(
            [
              ["Spielen", "/server"],
              ["Regeln", "/regeln"],
              ["Guide", "/guide"],
              ["Team-Prefix", "/prefix"],
              ["Karte", "/karte"],
              ["Community", "/community"],
              ["Staff", "/team"],
            ] as const
          ).map(([label, to]) => (
            <Link key={to} to={to} className="chip rounded-md border border-line bg-bg px-3 py-3 text-center text-sm font-semibold hover:border-gold hover:text-gold">
              {label}
            </Link>
          ))}
        </div>
      </section>

      <div className="shell mt-8">
        <MotdNotice />
        <div className="mt-3">
          <SiteBanner />
        </div>
      </div>

      <section className="shell py-16">
        <div className="max-w-2xl">
          <p className="kicker">Über AlpenSMP</p>
          <h2 className="display mt-3 text-4xl">Vanilla Survival, ohne Umwege.</h2>
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

      <section className="border-y border-line bg-bg-raised py-16">
        <div className="shell">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="kicker">Features</p>
              <h2 className="display mt-3 text-4xl">Was dich erwartet</h2>
            </div>
            <Link to="/features" className="btn-ghost">
              Alle Features
            </Link>
          </div>
          <div className="stagger mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((feature) => (
              <Link key={feature.id} to="/features" hash={feature.id} className="card p-4 hover:border-gold/50">
                <Sparkles className="hop-icon size-4 text-gold" />
                <h3 className="mt-2 font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted">{feature.summary}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="shell py-16">
        <p className="kicker">In Zahlen</p>
        <h2 className="display mt-3 text-4xl">AlpenSMP gerade jetzt</h2>
        <p className="mt-3 max-w-2xl text-muted">Live-Daten und Community-Zahlen – ohne Schnickschnack.</p>
        <div className="mt-8">
          <StatStrip />
        </div>
        <div className="mt-4">
          <PlayerChart />
        </div>
      </section>

      <section className="shell grid gap-4 pb-16 lg:grid-cols-3">
        <article className="card overflow-hidden lg:col-span-2">
          <img src="/media/lichen.jpg" alt="Fichten und Flechten im Alpenwald" className="tone-red h-44 w-full object-cover" />
          <div className="grid gap-6 p-6 md:grid-cols-2">
            <div>
              <div className="flex items-center gap-2 text-gold">
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
              <div className="flex items-center gap-2 text-gold">
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
        <article className="card flex flex-col justify-between p-6">
          <div>
            <div className="flex items-center gap-2 text-ice">
              <Mic className="size-4" />
              <h3 className="font-semibold text-fg">Voice, Karte, Discord</h3>
            </div>
            <p className="mt-3 text-sm text-muted">
              Simple Voice Chat ist optional. Die Live-Karte der Hauptworld ist gerade zu, der Speicher ist voll. Updates und Support laufen über Discord
              und TikTok {SITE.tiktokHandle}.
            </p>
          </div>
          <div className="mt-6 flex flex-col gap-2">
            <Link to="/karte" className="btn-ghost">
              Karte gerade zu
            </Link>
            <DiscordLink>Discord beitreten</DiscordLink>
            <TikTokLink>TikTok</TikTokLink>
            <Link to="/guide" className="btn-ghost">
              Spieler-Guide
            </Link>
          </div>
        </article>
      </section>

      <section className="border-t border-line bg-bg-raised py-16">
        <div className="shell">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="kicker">Stimmen</p>
              <h2 className="display mt-3 text-4xl">Was die Community sagt</h2>
            </div>
            <Link to="/community" className="btn-ghost">
              Alle Rezensionen
            </Link>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {REVIEWS.slice(0, 3).map((review) => (
              <blockquote key={review.name + review.text.slice(0, 12)} className="card p-5">
                <p className="text-gold">{"★".repeat(review.rating)}</p>
                <p className="mt-3 text-sm whitespace-pre-line text-fg">{review.text}</p>
                <footer className="mt-4 text-sm text-faint">{review.name}</footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>
    </Shell>
  );
}
