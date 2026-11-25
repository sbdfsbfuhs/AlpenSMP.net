import { useEffect, useState } from "react";
import { can } from "@/lib/alpen/roles";
import { fbGet, fbPush, fbSet, fbUpdate, type StaffSession } from "@/lib/alpen/staff";

function failureMessage(error: unknown, message: string) {
  return error instanceof Error ? `${message}: ${error.message}` : `${message}.`;
}

export function Website({ user, note }: { user: StaffSession; note: (text: string) => void }) {
  const [total, setTotal] = useState("");
  const [ip, setIp] = useState("");
  const [port, setPort] = useState("");
  const [version, setVersion] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [color, setColor] = useState("#f5c400");
  const [buttonLabel, setButtonLabel] = useState("");
  const [buttonHref, setButtonHref] = useState("");
  const [lockTitle, setLockTitle] = useState("Kurz offline");
  const [lockMessage, setLockMessage] = useState("Die Website ist kurz abgeschaltet.");
  const [currentStatus, setCurrentStatus] = useState<"unknown" | "online" | "banner" | "lockdown">("unknown");
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    fbGet<{ total_players_ever?: number }>("site_stats").then((row) => {
      if (!row) return;
      setTotal(String(row.total_players_ever ?? ""));
    }).catch((error) => setLoadError(failureMessage(error, "Spielerzahl konnte nicht geladen werden")));
    fbGet<{
      title?: string;
      message?: string;
      color?: string;
      button_label?: string;
      button_href?: string;
      lockdown?: boolean;
      is_active?: boolean;
    }>("site_status/active").then((row) => {
      if (!row) {
        setCurrentStatus("online");
        return;
      }
      setCurrentStatus(row.lockdown ? "lockdown" : row.is_active ? "banner" : "online");
      if (row.lockdown) {
        setLockTitle(row.title || "Kurz offline");
        setLockMessage(row.message || "");
      } else {
        setTitle(row.title || "");
        setMessage(row.message || "");
      }
      if (row.color?.startsWith("#")) setColor(row.color);
      setButtonLabel(row.button_label || "");
      setButtonHref(row.button_href || "");
    }).catch((error) => setLoadError(failureMessage(error, "Website-Status konnte nicht geladen werden")));
    fbGet<{
      server_ip?: { value?: string };
      bedrock_port?: { value?: string };
      recommended_version?: { value?: string };
    }>("site_settings").then((row) => {
      if (!row) return;
      setIp(row.server_ip?.value || "");
      setPort(row.bedrock_port?.value || "");
      setVersion(row.recommended_version?.value || "");
    }).catch((error) => setLoadError(failureMessage(error, "Serverangaben konnten nicht geladen werden")));
  }, []);

  async function saveTotal(next: number) {
    try {
      await fbUpdate("site_stats", { total_players_ever: next, updated_at: Date.now(), updated_by: user.username });
      await fbSet("total_players_ever", next);
      await fbPush("site_stats_history", { t: Date.now(), n: 0, total_players_ever: next, online_count: 0, by: user.username });
      setTotal(String(next));
      note("Spielerzahl gespeichert");
    } catch (error) {
      note(failureMessage(error, "Spielerzahl konnte nicht vollständig gespeichert werden"));
    }
  }

  return (
    <div className="space-y-4">
      {loadError ? <p className="rounded-lg border border-red-500/40 bg-red-950/30 p-3 text-sm text-red-200" role="alert">{loadError}</p> : null}
      <form
        className="card card-still space-y-4 p-4 sm:p-5"
        onSubmit={(event) => {
          event.preventDefault();
          void saveTotal(Number(total));
        }}
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-brand">Website-Statistik</p>
            <h2 className="mt-1 text-lg font-semibold">Spieler insgesamt</h2>
            <p className="mt-1 text-sm text-muted">Gesamtzahl der Spieler, die dem Server bisher beigetreten sind.</p>
          </div>
          <span className="rounded-full border border-line px-3 py-1 text-sm">{total || "—"} Spieler</span>
        </div>
        <label className="block text-sm font-medium">
          Gesamtzahl
          <input
            className="field mt-1 max-w-xs"
            type="number"
            min="0"
            step="1"
            required
            value={total}
            onChange={(event) => setTotal(event.target.value)}
          />
        </label>
        <div className="flex flex-wrap gap-2">
          <button className="btn-brand" type="submit">Zahl speichern</button>
          <button className="btn-ghost" type="button" onClick={() => void saveTotal(Number(total || 0) + 1)}>+1 Spieler</button>
          <button className="btn-ghost" type="button" onClick={() => void saveTotal(Number(total || 0) + 5)}>+5 Spieler</button>
        </div>
      </form>

      <form
        className="card card-still space-y-4 p-4 sm:p-5"
        onSubmit={async (event) => {
          event.preventDefault();
          const now = Date.now();
          const body = {
            id: "active",
            status_type: "custom",
            type: "custom",
            title,
            message,
            is_active: true,
            lockdown: false,
            color,
            button_label: buttonLabel,
            button_href: buttonHref,
            created_by: user.username,
            updated_by: user.username,
            created_at: now,
            updated_at: now,
            expires_at: null,
          };
          try {
            await fbSet("site_status/active", body);
            setCurrentStatus("banner");
          } catch (error) {
            note(failureMessage(error, "Banner konnte nicht veröffentlicht werden"));
            return;
          }
          try {
            await fbPush("site_status/log", body);
            note("Banner gesetzt");
          } catch (error) {
            note(failureMessage(error, "Banner wurde veröffentlicht, aber das Änderungsprotokoll konnte nicht gespeichert werden"));
          }
        }}
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-brand">Hinweis für Besucher</p>
            <h2 className="mt-1 text-lg font-semibold">Banner</h2>
            <p className="mt-1 text-sm text-muted">Das Banner erscheint oben auf der Website. Die Website bleibt erreichbar.</p>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-medium ${
            currentStatus === "lockdown"
              ? "bg-red-500/15 text-red-200"
              : currentStatus === "banner"
                ? "bg-amber-500/15 text-amber-200"
                : currentStatus === "online"
                  ? "bg-emerald-500/15 text-emerald-200"
                  : "border border-line text-muted"
          }`}>
            {currentStatus === "lockdown"
              ? "Wartungsmodus aktiv"
              : currentStatus === "banner"
                ? "Banner aktiv"
                : currentStatus === "online"
                  ? "Website online"
                  : "Status wird geladen"}
          </span>
        </div>
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium">Schnellvorlage</legend>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn-ghost" onClick={() => { setTitle("Bedrock aus"); setMessage("Bedrock ist wegen eines Minecraft-Updates kurz offline."); setColor("#f5c400"); }}>
              Bedrock-Ausfall
            </button>
            <button type="button" className="btn-ghost" onClick={() => { setTitle("Server-Neustart"); setMessage("Der Server startet gerade neu. Gleich wieder da."); setColor("#f5c400"); }}>
              Server-Neustart
            </button>
          </div>
          <p className="text-xs text-muted">Eine Vorlage füllt nur die Felder aus. Veröffentlicht wird sie erst mit „Banner veröffentlichen“.</p>
        </fieldset>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm font-medium">
            Titel
            <input className="field mt-1" placeholder="Zum Beispiel: Bedrock aus" value={title} onChange={(event) => setTitle(event.target.value)} />
          </label>
          <label className="flex items-center gap-3 rounded-lg border border-line p-3 text-sm font-medium">
            Bannerfarbe
            <input className="h-10 w-14 cursor-pointer rounded border-0 bg-transparent" type="color" value={color} aria-label="Bannerfarbe auswählen" onChange={(event) => setColor(event.target.value)} />
          </label>
        </div>
        <label className="block text-sm font-medium">
          Nachricht
          <textarea className="field mt-1 min-h-20" placeholder="Kurze Information für Besucher" value={message} onChange={(event) => setMessage(event.target.value)} />
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm font-medium">
            Knopftext <span className="font-normal text-muted">(optional)</span>
            <input className="field mt-1" placeholder="Zum Beispiel: Discord öffnen" value={buttonLabel} onChange={(event) => setButtonLabel(event.target.value)} />
          </label>
          <label className="block text-sm font-medium">
            Knopf-Link <span className="font-normal text-muted">(optional)</span>
            <input className="field mt-1" placeholder="/community oder https://…" value={buttonHref} onChange={(event) => setButtonHref(event.target.value)} />
          </label>
        </div>
        {(title || message || buttonLabel) ? (
          <div className="rounded-lg border border-line p-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Vorschau</p>
            <div className="rounded-md border-l-4 bg-panel p-3" style={{ borderLeftColor: color }}>
              <p className="font-semibold">{title || "Titel des Banners"}</p>
              <p className="mt-1 text-sm text-muted">{message || "Nachricht für Besucher"}</p>
              {buttonLabel ? <span className="mt-2 inline-block rounded border border-line px-2 py-1 text-xs">{buttonLabel}</span> : null}
            </div>
          </div>
        ) : null}
        <div className="flex flex-wrap gap-2">
          <button className="btn-brand" type="submit">Banner veröffentlichen</button>
          {currentStatus === "banner" ? (
            <button
              className="btn-ghost"
              type="button"
              onClick={async () => {
                const now = Date.now();
                const body = { id: "active", status_type: "online", type: "online", title: "Online", message: "Alles läuft stabil.", is_active: false, lockdown: false, color, button_label: "", button_href: "", created_by: user.username, updated_by: user.username, created_at: now, updated_at: now, expires_at: null };
                try {
                  await fbSet("site_status/active", body);
                  setCurrentStatus("online");
                  note("Banner entfernt; Website ist online");
                } catch (error) {
                  note(failureMessage(error, "Banner konnte nicht entfernt werden"));
                }
              }}
            >
              Banner entfernen
            </button>
          ) : null}
        </div>
      </form>

      {can(user.role, "lockdown") ? (
        <section className="card card-still space-y-4 border border-red-500/30 p-4 sm:p-5" aria-labelledby="lockdown-heading">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-red-300">Nur für Owner</p>
            <h2 id="lockdown-heading" className="mt-1 text-lg font-semibold">Wartungsmodus</h2>
            <p className="mt-1 text-sm text-muted">
              Schaltet nur die öffentliche Website ab. Besucher sehen Titel und Text unten; der Team-Login bleibt erreichbar.
            </p>
          </div>
          <div className={`rounded-lg border p-3 text-sm ${
            currentStatus === "lockdown" ? "border-red-500/40 bg-red-950/30 text-red-100" : "border-line text-muted"
          }`}>
            {currentStatus === "lockdown" ? "Die öffentliche Website ist derzeit im Wartungsmodus." : "Die öffentliche Website ist derzeit nicht im Wartungsmodus."}
          </div>
          <form
            className="space-y-4"
            onSubmit={async (event) => {
              event.preventDefault();
              if (!window.confirm("Die öffentliche Website für Besucher abschalten? Der Team-Login bleibt erreichbar.")) return;
              const now = Date.now();
              const body = {
                id: "active",
                status_type: "lockdown",
                type: "lockdown",
                title: lockTitle || "Kurz offline",
                message: lockMessage || "Die Website ist kurz abgeschaltet.",
                is_active: true,
                lockdown: true,
                color,
                button_label: "",
                button_href: "",
                created_by: user.username,
                updated_by: user.username,
                created_at: now,
                updated_at: now,
                expires_at: null,
              };
              try {
                await fbSet("site_status/active", body);
                setCurrentStatus("lockdown");
                note("Wartungsmodus aktiviert. Team-Login bleibt erreichbar.");
              } catch (error) {
                note(failureMessage(error, "Wartungsmodus konnte nicht aktiviert werden"));
              }
            }}
          >
            <label className="block text-sm font-medium">
              Titel für Besucher
              <input className="field mt-1" placeholder="Kurz offline" value={lockTitle} onChange={(event) => setLockTitle(event.target.value)} />
            </label>
            <label className="block text-sm font-medium">
              Nachricht für Besucher
              <textarea className="field mt-1 min-h-20" placeholder="Die Website ist kurz abgeschaltet." value={lockMessage} onChange={(event) => setLockMessage(event.target.value)} />
            </label>
            <div className="rounded-lg border border-line p-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Vorschau für Besucher</p>
              <h3 className="font-semibold">{lockTitle || "Kurz offline"}</h3>
              <p className="mt-1 text-sm text-muted">{lockMessage || "Die Website ist kurz abgeschaltet."}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button className="btn-ghost border border-red-500/50 text-red-200" type="submit">Wartungsmodus aktivieren</button>
              {currentStatus === "lockdown" ? (
                <button
                  className="btn-brand"
                  type="button"
                  onClick={async () => {
                    const now = Date.now();
                    const body = { id: "active", status_type: "online", type: "online", title: "Online", message: "Alles läuft stabil.", is_active: false, lockdown: false, color, button_label: "", button_href: "", created_by: user.username, updated_by: user.username, created_at: now, updated_at: now, expires_at: null };
                    try {
                      await fbSet("site_status/active", body);
                      setCurrentStatus("online");
                      note("Website wieder online");
                    } catch (error) {
                      note(failureMessage(error, "Website konnte nicht wieder aktiviert werden"));
                    }
                  }}
                >
                  Website wieder online schalten
                </button>
              ) : null}
            </div>
          </form>
        </section>
      ) : null}

      <form
        className="card card-still space-y-4 p-4 sm:p-5"
        onSubmit={async (event) => {
          event.preventDefault();
          const stamp = { updated_by: user.username, updated_at: Date.now() };
          const payload: Record<string, { value: string; updated_by: string; updated_at: number }> = {};
          if (ip) payload.server_ip = { value: ip, ...stamp };
          if (port) payload.bedrock_port = { value: port, ...stamp };
          if (version) payload.recommended_version = { value: version, ...stamp };
          try {
            await fbUpdate("site_settings", payload);
            note("Serverangaben gespeichert");
          } catch (error) {
            note(failureMessage(error, "Serverangaben konnten nicht gespeichert werden"));
          }
        }}
      >
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-brand">Verbindungsdaten</p>
          <h2 className="mt-1 text-lg font-semibold">Serverangaben</h2>
          <p className="mt-1 text-sm text-muted">Leere Felder lassen die gespeicherten Angaben unverändert.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm font-medium sm:col-span-2">
            Java-Serveradresse
            <input className="field mt-1" placeholder="alpensmp.net" value={ip} onChange={(event) => setIp(event.target.value)} autoComplete="url" />
          </label>
          <label className="block text-sm font-medium">
            Bedrock-Port
            <input className="field mt-1" type="number" min="1" max="65535" step="1" placeholder="19132" value={port} onChange={(event) => setPort(event.target.value)} />
          </label>
          <label className="block text-sm font-medium">
            Empfohlene Minecraft-Version
            <input className="field mt-1" placeholder="Zum Beispiel 1.21.x" value={version} onChange={(event) => setVersion(event.target.value)} />
          </label>
        </div>
        <button className="btn-brand w-full sm:w-auto" type="submit">Serverangaben speichern</button>
      </form>
    </div>
  );
}
