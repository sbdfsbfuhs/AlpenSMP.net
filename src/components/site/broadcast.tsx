import { useEffect, useState } from "react";
import { ArrowUpRight, Play } from "lucide-react";
import { countdown, useFbValue, type LiveStream, type ServerStatus } from "@/lib/alpen/broadcast";
import { liveStreamDestinations } from "@/lib/alpen/live-platforms";

const STATUS_COPY: Record<string, { icon: string; fallback: string; tone: string }> = {
  restarting: { icon: "🔄", fallback: "Server startet neu – bitte kurz warten.", tone: "restart" },
  maintenance: { icon: "🛠️", fallback: "Wartungsarbeiten – wir sind bald zurück.", tone: "maint" },
  down: { icon: "⛔", fallback: "Server aktuell nicht erreichbar.", tone: "down" },
  event: { icon: "🎉", fallback: "", tone: "event" },
  custom: { icon: "ℹ️", fallback: "", tone: "custom" },
};

function dismissed(key: string, id: string) {
  try {
    return localStorage.getItem(key) === id;
  } catch {
    return false;
  }
}

export function ServerStatusBanner() {
  const status = useFbValue<ServerStatus>("site_status/active");
  const [, setTick] = useState(0);
  const id = String(status?.updated_at || status?.title || "");
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    const timer = window.setInterval(() => setTick((n) => n + 1), 30000);
    return () => window.clearInterval(timer);
  }, []);
  useEffect(() => {
    setHidden(id ? dismissed("alpen-status-dismiss", id) : false);
  }, [id]);
  const type = status?.type || status?.status_type || "online";
  const copy = STATUS_COPY[type];
  const expired = Boolean(status?.expires_at && status.expires_at <= Date.now());
  const on = Boolean(status?.is_active && copy && !status.lockdown && !expired && !hidden);
  const text = status?.message || status?.title || copy?.fallback || "";
  const left = countdown(status?.expires_at);
  return (
    <div className={`status-slot${on ? " is-on" : ""}`}>
      <div>
        {on && copy ? (
          <div className={`status-banner tone-${copy.tone}`} role="status">
            <p>
              {copy.icon} {type === "event" || type === "custom" ? text || copy.fallback : copy.fallback}
              {left ? <span className="status-left"> {left}</span> : null}
            </p>
            <button
              type="button"
              className="status-x"
              aria-label="Hinweis schließen"
              onClick={() => {
                try {
                  localStorage.setItem("alpen-status-dismiss", id);
                } catch {
                  /* Privater Modus */
                }
                setHidden(true);
              }}
            >
              ×
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function HomeLiveCard() {
  const live = useFbValue<LiveStream>("live_streams/active");
  const [, setTick] = useState(0);
  useEffect(() => {
    const timer = window.setInterval(() => setTick((n) => n + 1), 30000);
    return () => window.clearInterval(timer);
  }, []);
  const destinations = liveStreamDestinations(live);
  if (!live?.is_live || !destinations.length) return null;
  const left = countdown(live.ends_at);
  return (
    <section id="home-live-card" className="home-live-card" aria-label="Community-Livestream, jetzt live">
      <div className="home-live-card-head">
        <p className="home-live-kicker">
          <i className="live-dot" aria-hidden="true" /> Jetzt live
        </p>
        <span className="home-live-platform">
          {destinations.length === 1 ? destinations[0]!.label : `${destinations.length} Plattformen`}
          {left ? ` · ${left}` : ""}
        </span>
      </div>
      <div className="home-live-card-main">
        <span className="home-live-play" aria-hidden="true"><Play className="size-5 fill-current" /></span>
        <div className="min-w-0">
          <p className="home-live-eyebrow">Aus der AlpenSMP-Community</p>
          <h2 className="home-live-name">{live.streamer_name || "Ein Teammitglied"}</h2>
          <p className="home-live-title">{live.title ? `„${live.title}“` : "Schau live beim Abenteuer zu."}</p>
        </div>
      </div>
      {destinations.length === 1 ? (
        <a
          className="btn-brand home-live-cta"
          href={destinations[0]!.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          Stream auf {destinations[0]!.label} ansehen <ArrowUpRight className="size-4" />
        </a>
      ) : (
        <nav className="home-live-cta home-live-cta-multiple" aria-label="Stream-Plattform auswählen">
          {destinations.map((destination) => (
            <a
              key={destination.id}
              className="btn-brand home-live-platform-cta"
              href={destination.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Stream auf ${destination.label} ansehen`}
            >
              {destination.label} <ArrowUpRight className="size-4" />
            </a>
          ))}
        </nav>
      )}
    </section>
  );
}

export function LiveDock() {
  const live = useFbValue<LiveStream>("live_streams/active");
  const destinations = liveStreamDestinations(live);
  const [ready, setReady] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [short, setShort] = useState(false);
  useEffect(() => {
    const timer = window.setTimeout(() => setReady(true), 3000);
    const measure = () => setShort(window.innerHeight <= 400);
    measure();
    window.addEventListener("resize", measure);
    try {
      setHidden(sessionStorage.getItem("alpen-live-hide") === "1");
    } catch {
      /* */
    }
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("resize", measure);
    };
  }, []);
  if (!ready || hidden || !live?.is_live || !destinations.length) return null;
  const primaryDestination = destinations[0]!;
  const platformChoice = destinations.length > 1;
  return (
    <aside className={short ? "live-strip" : "live-dock"} aria-label="Livestream">
      <i className="live-dot" aria-hidden="true" />
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold">{live.streamer_name || "Live"} streamt auf {primaryDestination.label}</p>
        {live.title ? <p className="truncate text-xs text-muted">{live.title}</p> : null}
      </div>
      <a
        className="btn-brand shrink-0 px-3"
        href={platformChoice ? "/#home-live-card" : primaryDestination.url}
        target={platformChoice ? undefined : "_blank"}
        rel={platformChoice ? undefined : "noopener noreferrer"}
      >
        {platformChoice ? "Plattform wählen" : "Ansehen"}
      </a>
      <button
        type="button"
        className="status-x"
        aria-label="Live-Hinweis schließen"
        onClick={() => {
          try {
            sessionStorage.setItem("alpen-live-hide", "1");
          } catch {
            /* */
          }
          setHidden(true);
        }}
      >
        ×
      </button>
    </aside>
  );
}
