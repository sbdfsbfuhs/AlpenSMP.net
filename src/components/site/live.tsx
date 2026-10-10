import { Copy } from "lucide-react";
import { CopyBurst, CopyTick, useCopyBurst } from "@/components/site/copy-burst";
import { useEffect, useMemo, useRef, useState } from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { fetchDiscordCount, fetchHistory, fetchSiteStats, fetchStatus, pruneOldHistory, recordPlayerSample, type HistoryPoint, type ServerStatus } from "@/lib/alpen/live";
import { SITE } from "@/lib/alpen/site";

export function useServerStatus() {
  const [status, setStatus] = useState<ServerStatus | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let stop = false;
    const load = () => {
      fetchStatus()
        .then((data) => {
          if (!stop) {
            setStatus(data);
            setError(false);
            if (data.online) void recordPlayerSample(data.players).catch(() => {});
          }
        })
        .catch(() => {
          if (!stop) setError(true);
        });
    };
    load();
    const id = window.setInterval(load, 45000);
    return () => {
      stop = true;
      window.clearInterval(id);
    };
  }, []);

  return { status, error };
}

export function CopyIp({ value, label }: { value: string; label: string }) {
  const burst = useCopyBurst();
  return (
    <button
      type="button"
      className={`btn-ghost copy-slot relative w-full justify-between ${burst.copied ? "is-copied" : ""}`}
      onClick={(event) => void burst.copy(value, event)}
    >
      <CopyBurst burst={burst.burst} />
      <span className="text-left">
        <span className="block text-xs font-medium text-faint">{burst.copied ? "Kopiert!" : label}</span>
        <span className="font-semibold tracking-wide text-fg">{value}</span>
      </span>
      {burst.copied ? <CopyTick /> : <Copy className="size-4 text-gold" />}
    </button>
  );
}

export function StatusCard() {
  const { status, error } = useServerStatus();
  const online = status?.online;
  return (
    <aside className="card p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold">Serverstatus</p>
        <span className={`inline-flex items-center gap-2 text-sm font-semibold ${online ? "text-ice" : "text-ember"}`}>
          <span className={online ? "pulse-dot" : "pulse-dot off"} aria-hidden="true" />
          {status ? (online ? "Online" : "Offline") : error ? "Unbekannt" : "Lädt…"}
        </span>
      </div>
      <p className="display mt-4 text-4xl text-fg">
        {status ? `${status.players}` : "–"}
        <span className="text-xl text-muted"> / {status ? status.max : "–"}</span>
      </p>
      <p className="mt-1 text-sm text-muted">Spieler gerade auf dem Server</p>
      <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-faint">Software</dt>
          <dd className="font-medium">{status ? `${status.software} ${status.version}` : "Paper 1.21.11"}</dd>
        </div>
        <div>
          <dt className="text-faint">Empfohlen</dt>
          <dd className="font-medium">Minecraft {SITE.version}</dd>
        </div>
      </dl>
      <div className="mt-5 space-y-2">
        <CopyIp value={SITE.ip} label="Java" />
        <CopyIp value={SITE.play} label="Bedrock" />
        <CopyIp value={SITE.bedrockPort} label="Bedrock-Port" />
      </div>
    </aside>
  );
}

export type SiteNotice = {
  title?: string;
  message?: string;
  is_active?: boolean;
  lockdown?: boolean;
  color?: string;
  button_label?: string;
  button_href?: string;
};

export function useSiteNotice() {
  const [notice, setNotice] = useState<SiteNotice | null>(null);
  useEffect(() => {
    let stop = false;
    const pull = () => {
      fetch(`${SITE.fb}/site_status/active.json`)
        .then((res) => res.json())
        .then((data) => {
          if (!stop && data && typeof data === "object") setNotice(data as SiteNotice);
        })
        .catch(() => {});
    };
    pull();
    const id = window.setInterval(pull, 12000);
    return () => {
      stop = true;
      window.clearInterval(id);
    };
  }, []);
  return notice;
}

function ink(hex: string) {
  const h = hex.replace("#", "");
  if (h.length !== 6) return "#14080b";
  const r = Number.parseInt(h.slice(0, 2), 16);
  const g = Number.parseInt(h.slice(2, 4), 16);
  const b = Number.parseInt(h.slice(4, 6), 16);
  if ([r, g, b].some((n) => Number.isNaN(n))) return "#14080b";
  return (r * 299 + g * 587 + b * 114) / 1000 > 160 ? "#14080b" : "#fff6f6";
}

export function CautionTape({ notice }: { notice: SiteNotice | null }) {
  if (!notice?.is_active || !notice.title) return null;
  const color = notice.color?.startsWith("#") ? notice.color : "#f5c400";
  const line = `${notice.title}${notice.message ? ` — ${notice.message}` : ""}`;
  return (
    <div className="caution" style={{ background: color, color: ink(color) }}>
      <div className="caution-track">
        {Array.from({ length: 8 }, (_, i) => (
          <span key={i}>{line}</span>
        ))}
      </div>
      {notice.button_label ? (
        <a className="caution-btn" href={notice.button_href || "/server"}>
          {notice.button_label}
        </a>
      ) : null}
    </div>
  );
}

export function SiteBanner() {
  return null;
}

export function MotdNotice() {
  const { status } = useServerStatus();
  const lines = status?.motd ?? [];
  if (!lines.length) return null;
  return (
    <p className="rounded-md border border-gold/30 bg-gold/10 px-4 py-3 text-sm text-fg">
      <span className="font-semibold text-gold">Vom Server: </span>
      {lines.join(" · ")}
    </p>
  );
}

export function StatStrip() {
  const { status } = useServerStatus();
  const [total, setTotal] = useState<number | null>(null);
  const [discord, setDiscord] = useState<number | null>(null);
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const [onlinePulse, setOnlinePulse] = useState(false);
  const seenOnline = useRef<number | null>(null);

  useEffect(() => {
    fetchSiteStats().then((row) => setTotal(row.total)).catch(() => {});
    fetchDiscordCount().then(setDiscord).catch(() => {});
    fetchHistory().then(setHistory).catch(() => {});
  }, []);

  useEffect(() => {
    const next = status?.players;
    if (next == null) return;
    if (seenOnline.current != null && seenOnline.current !== next) {
      setOnlinePulse(true);
      const id = window.setTimeout(() => setOnlinePulse(false), 700);
      seenOnline.current = next;
      return () => window.clearTimeout(id);
    }
    seenOnline.current = next;
  }, [status]);

  const windowed = useMemo(() => {
    const now = Date.now();
    const day = history.filter((p) => now - p.t < 86400000);
    const source = day.length ? day : history;
    const peak = source.reduce((m, p) => Math.max(m, p.n), 0);
    const avg = source.length ? Math.round(source.reduce((s, p) => s + p.n, 0) / source.length) : 0;
    return { peak, avg, span: day.length ? "24 Stunden" : "geladener Verlauf" };
  }, [history]);

  const items = [
    { label: "Unique-Spieler", value: total, hint: "je auf dem Server" },
    { label: "Online jetzt", value: status ? status.players : null, hint: status ? `von ${status.max}` : "Live", live: true },
    { label: "Peak", value: history.length ? windowed.peak : null, hint: windowed.span },
    { label: "Schnitt", value: history.length ? windowed.avg : null, hint: windowed.span },
    { label: "Discord", value: discord, hint: "Mitglieder" },
    { label: "Stimmen", value: 14, suffix: "+", hint: "freigegebene Rezensionen" },
  ];

  return (
    <div className="stagger grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
      {items.map((item) => (
        <div key={item.label} className="card px-4 py-4">
          <p className={`display text-3xl text-fg ${item.live && onlinePulse ? "stat-pulse" : ""}`}>
            <CountUp value={item.value} suffix={"suffix" in item ? item.suffix : ""} />
          </p>
          <p className="mt-1 text-sm font-medium">{item.label}</p>
          <p className="text-xs text-faint">{item.hint}</p>
        </div>
      ))}
    </div>
  );
}

function CountUp({ value, suffix = "" }: { value: number | null; suffix?: string }) {
  const shown = useCount(value);
  if (value == null) return "–";
  return `${shown}${suffix}`;
}

function useCount(target: number | null, ms = 800) {
  const [shown, setShown] = useState(0);
  const from = useRef(0);

  useEffect(() => {
    if (target == null) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      from.current = target;
      setShown(target);
      return;
    }
    const start = from.current;
    const delta = target - start;
    const t0 = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / ms);
      const eased = 1 - (1 - p) ** 3;
      setShown(Math.round(start + delta * eased));
      if (p < 1) frame = requestAnimationFrame(tick);
      else from.current = target;
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, ms]);

  return shown;
}

export function PlayerChart() {
  const [range, setRange] = useState<"1h" | "5h" | "24h" | "7d">("24h");
  const [points, setPoints] = useState<HistoryPoint[]>([]);

  useEffect(() => {
    let stop = false;
    const load = () => {
      fetchHistory()
        .then((rows) => {
          if (!stop) setPoints(rows);
        })
        .catch(() => {});
    };
    load();
    void pruneOldHistory().catch(() => {});
    const id = window.setInterval(load, 180000);
    return () => {
      stop = true;
      window.clearInterval(id);
    };
  }, []);

  const rows = useMemo(() => {
    const span = range === "1h" ? 3600000 : range === "5h" ? 18000000 : range === "24h" ? 86400000 : 7 * 86400000;
    const now = Date.now();
    return points
      .filter((p) => p.t <= now + 60000 && now - p.t <= span)
      .map((p) => ({
        label: new Date(p.t).toLocaleString("de-CH", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }),
        spieler: p.n,
      }));
  }, [points, range]);

  return (
    <div className="card p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold">Spieler online – Verlauf</h3>
          <p className="text-sm text-muted">Nur der gewählte Zeitraum. Älter als 7 Tage wird gelöscht.</p>
        </div>
        <div className="flex gap-2">
          {(["1h", "5h", "24h", "7d"] as const).map((key) => (
            <button
              key={key}
              type="button"
              className={key === range ? "btn-gold px-3" : "btn-ghost px-3"}
              onClick={() => setRange(key)}
            >
              {key === "1h" ? "1 Std" : key === "5h" ? "5 Std" : key === "24h" ? "24 Std" : "7 Tage"}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-4 h-56 min-w-0">
        {rows.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={rows}>
              <CartesianGrid stroke="var(--color-line)" vertical={false} />
              <XAxis dataKey="label" hide />
              <YAxis allowDecimals={false} width={28} stroke="var(--color-faint)" fontSize={12} />
              <Tooltip
                contentStyle={{ background: "var(--color-surface)", border: "1px solid var(--color-line)", borderRadius: 12, color: "var(--color-fg)" }}
                labelStyle={{ color: "var(--color-muted)" }}
              />
              <Line type="monotone" dataKey="spieler" stroke="var(--color-gold)" strokeWidth={2} dot={rows.length < 30} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-sm text-muted">In diesem Zeitraum gibt es noch keine Messung.</p>
        )}
      </div>
    </div>
  );
}
