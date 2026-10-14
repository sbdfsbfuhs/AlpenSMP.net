import { useEffect, useState } from "react";
import { countdown, useFbValue, type LiveStream, type ServerStatus } from "@/lib/alpen/broadcast";

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

const PLATFORMS: Record<string, string> = {
  twitch: "Twitch",
  youtube: "YouTube",
  tiktok: "TikTok",
  kick: "Kick",
  other: "Stream",
};

export function LiveHero() {
  const live = useFbValue<LiveStream>("live_streams/active");
  const [, setTick] = useState(0);
  useEffect(() => {
    const timer = window.setInterval(() => setTick((n) => n + 1), 30000);
    return () => window.clearInterval(timer);
  }, []);
  if (!live?.is_live || !live.url) return null;
  const left = countdown(live.ends_at);
  return (
    <section className="live-hero" aria-label="Livestream">
      <div className="shell live-hero-row">
        <div>
          <p className="live-kicker"><i className="live-dot" aria-hidden="true" /> Jetzt live</p>
          <p className="mt-1 text-lg font-semibold">{live.streamer_name || "Jemand"} streamt AlpenSMP</p>
          {live.title ? <p className="mt-1 text-sm text-muted">„{live.title}"</p> : null}
          <p className="mt-1 text-xs text-faint">{PLATFORMS[live.platform || "other"] || live.platform}{left ? ` · ${left}` : ""}</p>
        </div>
        <a className="btn-brand" href={live.url} target="_blank" rel="noopener noreferrer">
          ▶ Stream ansehen
        </a>
      </div>
    </section>
  );
}

export function LiveDock() {
  const live = useFbValue<LiveStream>("live_streams/active");
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
  if (!ready || hidden || !live?.is_live || !live.url) return null;
  return (
    <aside className={short ? "live-strip" : "live-dock"} aria-label="Livestream">
      <i className="live-dot" aria-hidden="true" />
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold">{live.streamer_name || "Live"} streamt</p>
        {live.title ? <p className="truncate text-xs text-muted">{live.title}</p> : null}
      </div>
      <a className="btn-brand shrink-0 px-3" href={live.url} target="_blank" rel="noopener noreferrer">
        Ansehen
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
