import type { ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { CautionTape, useSiteNotice } from "@/components/site/live";
import { LockScreen } from "@/components/site/offline-run";
import { MORE, NAV, SITE } from "@/lib/alpen/site";

export function Shell({ children }: { children: ReactNode }) {
  const notice = useSiteNotice();
  const path = useRouterState({ select: (state) => state.location.pathname });
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const el = event.target instanceof Element ? event.target.closest("button, a, summary") : null;
      if (!el) return;
      navigator.vibrate?.(15);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);
  const locked = Boolean(
    notice?.is_active && notice.lockdown && !path.startsWith("/team") && path !== "/ki-transparenz",
  );
  if (locked && notice) {
    return <LockScreen notice={notice} />;
  }
  return (
    <div className="relative min-h-screen bg-bg text-fg">
      <div className="aurora" aria-hidden="true" />
      <div className="embers" aria-hidden="true">
        <span /><span /><span /><span /><span /><span /><span /><span />
      </div>
      <div className="relative z-10">
      <CautionTape notice={notice} />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-gold focus:px-3 focus:py-2 focus:text-fg"
      >
        Zum Inhalt springen
      </a>
      <Header />
      <main id="main" key={path} className="page-enter">{children}</main>
      <Footer />
      </div>
    </div>
  );
}

function Mark() {
  return <img src="/logo.png" alt="" className="size-11 object-contain" />;
}

function Header() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-bg/90 backdrop-blur">
      <div className="shell flex h-16 items-center gap-4">
        <Link to="/" className="brand flex items-center gap-3" onClick={close}>
          <Mark />
          <span className="display text-lg text-fg">
            Alpen<span className="text-gold">SMP</span>
          </span>
        </Link>
        <nav className="ml-auto hidden items-center gap-1 lg:flex" aria-label="Hauptnavigation">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              className="nav-link rounded-md px-3 py-2 text-sm text-muted hover:text-fg data-[status=active]:text-fg"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <Link to="/server" className="btn-gold hidden sm:inline-flex">
          Beitreten
        </Link>
        <button
          type="button"
          className="ml-auto grid size-11 place-items-center rounded-md border border-line text-fg lg:hidden"
          aria-expanded={open}
          aria-label={open ? "Menü schließen" : "Menü öffnen"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>
      {open ? (
        <nav className="border-t border-line bg-bg-raised lg:hidden" aria-label="Mobile Navigation">
          <div className="shell flex flex-col py-3">
            {[...NAV, ...MORE].map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="min-h-11 rounded-md px-2 py-3 text-base text-fg"
                onClick={close}
              >
                {item.label}
              </Link>
            ))}
            <Link to="/server" className="btn-gold mt-2" onClick={close}>
              Beitreten
            </Link>
          </div>
        </nav>
      ) : null}
    </header>
  );
}

function Footer() {
  return (
    <footer className="relative z-20 mt-20 border-t border-line bg-bg">
      <div className="shell grid gap-10 py-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <p className="display text-2xl">
            Alpen<span className="text-gold">SMP</span>
          </p>
          <p className="mt-3 max-w-sm text-sm text-muted">
            Java {SITE.ip}. Bedrock {SITE.play}, Port {SITE.bedrockPort}.
          </p>
          <p className="mt-4 text-sm text-faint">Privater, nicht-kommerzieller Minecraft-Server.</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-fg">Seiten</p>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            {[...NAV, ...MORE].map((item) => (
              <li key={item.to}>
                <Link to={item.to} className="hover:text-gold">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold text-fg">Community</p>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            <li>
              <DiscordLink>Discord</DiscordLink>
            </li>
            <li className="pt-2">
              <TikTokLink />
            </li>
            <li>
              <Link to="/karte" className="hover:text-gold">
                Live-Karte
              </Link>
            </li>
            <li>
              <button type="button" className="hover:text-gold" onClick={() => window.dispatchEvent(new Event("alpen-open-ki"))}>
                AlpenKI
              </button>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-line">
        <div className="shell flex flex-col gap-2 py-4 text-xs text-faint sm:flex-row sm:justify-between">
          <span>© 2026 AlpenSMP</span>
          <a href="/ki-transparenz" className="hover:text-gold">
            KI-Transparenz
          </a>
        </div>
      </div>
    </footer>
  );
}

export function PageHero({
  kicker,
  title,
  lede,
}: {
  kicker: string;
  title: string;
  lede: string;
}) {
  return (
    <header className="relative overflow-hidden border-b border-line bg-bg-raised">
      <div className="glow-line" />
      <span className="hero-mote" aria-hidden="true" />
      <span className="hero-mote late" aria-hidden="true" />
      <div className="shell py-14 md:py-16">
        <p className="kicker">{kicker}</p>
        <h1 className="display mt-3 max-w-3xl text-4xl text-fg md:text-5xl">{title}</h1>
        <p className="mt-4 max-w-2xl text-lg text-muted">{lede}</p>
      </div>
    </header>
  );
}

export function DiscordLink({ children = "Discord", className = "" }: { children?: ReactNode; className?: string }) {
  return (
    <a className={`btn-discord ${className}`} href={SITE.discord} target="_blank" rel="noreferrer">
      <SocialBlobs />
      <DiscordMark />
      <span className="relative">{children}</span>
    </a>
  );
}

export function TikTokLink({ children, className = "" }: { children?: ReactNode; className?: string }) {
  return (
    <a className={`btn-tiktok ${className}`} href={SITE.tiktok} target="_blank" rel="noreferrer">
      <SocialBlobs />
      <TikTokMark className="relative size-5" />
      <span className="relative">{children ?? `TikTok ${SITE.tiktokHandle}`}</span>
    </a>
  );
}

function SocialBlobs() {
  return (
    <>
      <span className="blob btn-blob a" />
      <span className="blob btn-blob b" />
      <span className="blob btn-blob c" />
    </>
  );
}

export function DiscordMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true" fill="currentColor">
      <path d="M19.3 5.2A17 17 0 0 0 15.1 4l-.4.8a15 15 0 0 1 3.7 1.4 16 16 0 0 0-13 0A12 12 0 0 1 9.2 4.8L8.8 4a17 17 0 0 0-4.2 1.2C2.4 8.4 1.8 11.5 2 14.6A17 17 0 0 0 7.2 17l.8-1.1a11 11 0 0 1-1.3-.6l.3-.2c2.6 1.2 5.4 1.2 8 0l.3.2c-.4.2-.9.5-1.3.6l.8 1.1a17 17 0 0 0 5.2-2.4c.4-3.6-.5-6.7-2-9.4ZM9.2 13.4c-.8 0-1.5-.8-1.5-1.7s.7-1.7 1.5-1.7 1.5.8 1.5 1.7-.7 1.7-1.5 1.7Zm5.6 0c-.8 0-1.5-.8-1.5-1.7s.7-1.7 1.5-1.7 1.5.8 1.5 1.7-.7 1.7-1.5 1.7Z" />
    </svg>
  );
}

export function TikTokMark({ className = "size-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path fill="#25f4ee" d="M14.2 3.2c.5 2.3 1.8 3.9 4 4.5v2.4a6.6 6.6 0 0 1-4-1.3v6.4a5.6 5.6 0 1 1-5.6-5.6c.2 0 .5 0 .7.1v2.6a3 3 0 1 0 2.1 2.9V3.2h2.8Z" />
      <path fill="#fe2c55" d="M15 3.6c.5 2.3 1.8 3.9 4 4.5v2.4a6.6 6.6 0 0 1-4-1.3v6.4a5.6 5.6 0 1 1-5.6-5.6c.2 0 .5 0 .7.1v2.6a3 3 0 1 0 2.1 2.9V3.6H15Z" />
      <path fill="#fff" d="M14.5 3.3c.5 2.3 1.8 3.9 4 4.5v2.4a6.6 6.6 0 0 1-4-1.3v6.4a5.6 5.6 0 1 1-5.6-5.6c.2 0 .5 0 .7.1v2.6a3 3 0 1 0 2.1 2.9V3.3h2.8Z" />
    </svg>
  );
}
