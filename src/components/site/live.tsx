import { Check, Copy } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { fetchDiscordCount, fetchHistory, fetchSiteStats, fetchStatus, type HistoryPoint, type ServerStatus } from "@/lib/alpen/live";
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
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      className={`btn-ghost copy-slot relative w-full justify-between ${done ? "is-copied" : ""}`}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setDone(true);
          window.setTimeout(() => setDone(false), 1200);
        } catch {
          setDone(false);
        }
      }}
    >
      <span className="text-left">
        <span className="block text-xs font-medium text-faint">{label}</span>
        <span className="font-semibold tracking-wide text-fg">{value}</span>
      </span>
      {done ? <span className="copy-sparks" aria-hidden="true" /> : null}
      {done ? <Check className="copy-check size-4" /> : <Copy className="size-4 text-gold" />}
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
      <div className="mt-5">
        <CopyIp value={SITE.ip} label="Server-Adresse" />
      </div>
    </aside>
  );
}

export function SiteBanner() {
  const [banner, setBanner] = useState<{ title?: string; message?: string; is_active?: boolean } | null>(null);
  useEffect(() => {
    fetch(`${SITE.fb}/site_status/active.json`)
      .then((res) => res.json())
      .then((data) => setBanner(data))
      .catch(() => {});
  }, []);
  if (!banner?.is_active || !banner.title) return null;
  return (
    <p className="rounded-md border border-gold/30 bg-gold/10 px-4 py-3 text-sm text-fg">
      <span className="font-semibold text-gold">{banner.title}: </span>
      {banner.message}
    </p>
  );
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

  useEffect(() => {
    fetchSiteStats().then((row) => setTotal(row.total)).catch(() => {});
    fetchDiscordCount().then(setDiscord).catch(() => {});
    fetchHistory().then(setHistory).catch(() => {});
  }, []);

  const windowed = useMemo(() => {
    const now = Date.now();
    const day = history.filter((p) => now - p.t < 86400000);
    const source = day.length ? day : history;
    const peak = source.reduce((m, p) => Math.max(m, p.n), 0);
    const avg = source.length ? Math.round(source.reduce((s, p) => s + p.n, 0) / source.length) : 0;
    return { peak, avg, span: day.length ? "24 Stunden" : "geladener Verlauf" };
  }, [history]);

  const items = [
    { label: "Unique-Spieler", value: total ?? "–", hint: "je auf dem Server" },
    { label: "Online jetzt", value: status ? status.players : "–", hint: status ? `von ${status.max}` : "Live" },
    { label: "Peak", value: history.length ? windowed.peak : "–", hint: windowed.span },
    { label: "Schnitt", value: history.length ? windowed.avg : "–", hint: windowed.span },
    { label: "Discord", value: discord ?? "–", hint: "Mitglieder" },
    { label: "Stimmen", value: "14+", hint: "freigegebene Rezensionen" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
      {items.map((item) => (
        <div key={item.label} className="card px-4 py-4">
          <p className="display text-3xl text-fg">{item.value}</p>
          <p className="mt-1 text-sm font-medium">{item.label}</p>
          <p className="text-xs text-faint">{item.hint}</p>
        </div>
      ))}
    </div>
  );
}

export function PlayerChart() {
  const [range, setRange] = useState<"1h" | "5h" | "24h">("24h");
  const [points, setPoints] = useState<HistoryPoint[]>([]);

  useEffect(() => {
    fetchHistory().then(setPoints).catch(() => {});
  }, []);

  const data = useMemo(() => {
    const span = range === "1h" ? 3600000 : range === "5h" ? 18000000 : 86400000;
    const now = Date.now();
    return points
      .filter((p) => now - p.t <= span)
      .map((p) => ({
        label: new Date(p.t).toLocaleTimeString("de-CH", { hour: "2-digit", minute: "2-digit" }),
        spieler: p.n,
      }));
  }, [points, range]);

  return (
    <div className="card p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold">Spieler online – Verlauf</h3>
          <p className="text-sm text-muted">Aus den Live-Zählungen des Servers.</p>
        </div>
        <div className="flex gap-2">
          {(["1h", "5h", "24h"] as const).map((key) => (
            <button
              key={key}
              type="button"
              className={key === range ? "btn-gold px-3" : "btn-ghost px-3"}
              onClick={() => setRange(key)}
            >
              {key === "1h" ? "1 Std" : key === "5h" ? "5 Std" : "24 Std"}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-4 h-56">
        {data.length > 1 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid stroke="var(--color-line)" vertical={false} />
              <XAxis dataKey="label" hide />
              <YAxis allowDecimals={false} width={28} stroke="var(--color-faint)" fontSize={12} />
              <Tooltip
                contentStyle={{ background: "var(--color-surface)", border: "1px solid var(--color-line)", borderRadius: 12, color: "var(--color-fg)" }}
                labelStyle={{ color: "var(--color-muted)" }}
              />
              <Line type="monotone" dataKey="spieler" stroke="var(--color-gold)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-sm text-muted">Verlauf erscheint, sobald Status-Daten da sind.</p>
        )}
      </div>
    </div>
  );
}
