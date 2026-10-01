import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { MORE, NAV, SITE } from "@/lib/alpen/site";

export function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen bg-bg text-fg">
      <div className="aurora" aria-hidden="true" />
      <div className="embers" aria-hidden="true">
        <span /><span /><span /><span /><span /><span /><span /><span />
      </div>
      <div className="relative z-10">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-gold focus:px-3 focus:py-2 focus:text-fg"
      >
        Zum Inhalt springen
      </a>
      <Header />
      <main id="main" className="page-enter">{children}</main>
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
        <Link to="/" className="flex items-center gap-3" onClick={close}>
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
            Vanilla Survival · Java & Bedrock · Faire Community · Persönliche Serverleitung
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
              <a href={SITE.discord} target="_blank" rel="noreferrer" className="hover:text-gold">
                Discord
              </a>
            </li>
            <li>
              <a href={SITE.tiktok} target="_blank" rel="noreferrer" className="hover:text-gold">
                TikTok {SITE.tiktokHandle}
              </a>
            </li>
            <li>
              <a href={SITE.map} target="_blank" rel="noreferrer" className="hover:text-gold">
                Live-Karte
              </a>
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
          <span>Für die Community gebaut.</span>
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
      <div className="shell py-14 md:py-16">
        <p className="kicker">{kicker}</p>
        <h1 className="display mt-3 max-w-3xl text-4xl text-fg md:text-5xl">{title}</h1>
        <p className="mt-4 max-w-2xl text-lg text-muted">{lede}</p>
      </div>
    </header>
  );
}
