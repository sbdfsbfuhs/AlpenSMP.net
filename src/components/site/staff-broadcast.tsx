import { useEffect, useMemo, useState, type FormEvent } from "react";
import { countdown, useFbValue, type LiveStream, type NewsCategory, type NewsItem, type ServerStatus } from "@/lib/alpen/broadcast";
import { fbGet, fbPush, fbRemove, fbSet, fbUpdate, formatWhen, type StaffSession } from "@/lib/alpen/staff";
import { currentLogin } from "@/lib/alpen/fb-auth";
import { autoSeason, SEASONS } from "@/lib/alpen/seasons";
import { groupLiveNotices } from "@/lib/alpen/live-notices";
import { MascotView } from "@/components/site/mascot-art";

const CATS: NewsCategory[] = ["Update", "Regel", "Command", "Event", "Wartung", "Neu"];

export function NewsEditor({ user, note }: { user: StaffSession; note: (text: string) => void }) {
  const raw = useFbValue<Record<string, NewsItem>>("changelog");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<NewsCategory>("Update");
  const [url, setUrl] = useState("");
  const [published, setPublished] = useState(true);
  const rows = Object.entries(raw ?? {}).sort((a, b) => (b[1].date || 0) - (a[1].date || 0));

  async function save(event: FormEvent) {
    event.preventDefault();
    if (!title.trim()) return note("Titel fehlt");
    await fbPush("changelog", {
      title: title.trim(),
      description: description.trim(),
      category,
      url: url.trim(),
      published,
      date: Date.now(),
      by: user.username,
    });
    setTitle("");
    setDescription("");
    setUrl("");
    note(published ? "News veröffentlicht" : "Entwurf gespeichert");
  }

  return (
    <div className="space-y-4">
      <form className="card card-still p-5" onSubmit={(event) => void save(event)}>
        <h2 className="text-lg font-semibold">News schreiben</h2>
        <input className="field mt-3" placeholder="Titel" value={title} onChange={(e) => setTitle(e.target.value)} />
        <textarea className="field mt-2 min-h-28" placeholder="Text. **fett** und Zeilenumbrüche gehen." value={description} onChange={(e) => setDescription(e.target.value)} />
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          <select className="field" value={category} onChange={(e) => setCategory(e.target.value as NewsCategory)}>
            {CATS.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
          <input className="field" placeholder="Link, optional" value={url} onChange={(e) => setUrl(e.target.value)} />
        </div>
        <label className="mt-3 flex items-center gap-2 text-sm">
          <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
          Öffentlich sichtbar
        </label>
        <button className="btn-brand mt-4" type="submit">Speichern</button>
      </form>
      <ul className="space-y-2">
        {rows.map(([id, item]) => (
          <li key={id} className="card card-still flex flex-wrap items-center justify-between gap-3 p-4 text-sm">
            <div>
              <p className="font-semibold">{item.title}</p>
              <p className="text-muted">{item.category} · {item.published ? "sichtbar" : "Entwurf"} · {formatWhen(item.date)}</p>
            </div>
            <div className="flex gap-2">
              <button type="button" className="btn-ghost" onClick={() => void fbUpdate(`changelog/${id}`, { published: !item.published }).then(() => note(item.published ? "Versteckt" : "Sichtbar"))}>
                {item.published ? "Verstecken" : "Zeigen"}
              </button>
              <button type="button" className="btn-ghost" onClick={() => void fbRemove(`changelog/${id}`).then(() => note("Gelöscht"))}>
                Löschen
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

const QUICK: { type: string; label: string; title: string; message: string }[] = [
  { type: "online", label: "Online ✓", title: "Online", message: "Alles läuft stabil." },
  { type: "restarting", label: "Neustart 🔄", title: "Neustart", message: "Server startet neu – bitte kurz warten." },
  { type: "maintenance", label: "Wartung 🛠️", title: "Wartung", message: "Wartungsarbeiten – wir sind bald zurück." },
  { type: "down", label: "Down ⛔", title: "Nicht erreichbar", message: "Server aktuell nicht erreichbar." },
];

export function StatusDesk({ user, note }: { user: StaffSession; note: (text: string) => void }) {
  const status = useFbValue<ServerStatus>("site_status/active");
  const log = useFbValue<Record<string, ServerStatus>>("site_status/log");
  const [type, setType] = useState("event");
  const [message, setMessage] = useState("");
  const [until, setUntil] = useState("");
  const recent = useMemo(
    () => Object.values(log ?? {}).sort((a, b) => (b.updated_at || 0) - (a.updated_at || 0)).slice(0, 10),
    [log],
  );

  async function publish(nextType: string, title: string, text: string, expires: number | null) {
    const current = (await fbGet<ServerStatus>("site_status/active")) || {};
    const body: ServerStatus = {
      ...current,
      type: nextType,
      status_type: nextType,
      title,
      message: text.slice(0, 120),
      is_active: nextType === "online" ? Boolean(current.lockdown) : true,
      lockdown: Boolean(current.lockdown),
      expires_at: expires,
      created_by: user.username,
      updated_by: user.username,
      updated_at: Date.now(),
    };
    await fbSet("site_status/active", body);
    await fbPush("site_status/log", body);
    note(nextType === "online" ? "Status: online" : "Status gesetzt");
  }

  return (
    <div className="space-y-4">
      <div className="card card-still p-5">
        <h2 className="text-lg font-semibold">Vorschau</h2>
        <p className="mt-2 text-sm text-muted">
          {status?.is_active && status.type && status.type !== "online"
            ? `${status.type}: ${status.message || status.title}`
            : "Kein Banner. Der Server gilt als online."}
          {status?.expires_at ? ` · ${countdown(status.expires_at) || "abgelaufen"}` : ""}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {QUICK.map((item) => (
            <button key={item.type} type="button" className="btn-ghost" onClick={() => void publish(item.type, item.title, item.message, null)}>
              {item.label}
            </button>
          ))}
        </div>
      </div>
      <form
        className="card card-still p-5"
        onSubmit={(event) => {
          event.preventDefault();
          if ((type === "event" || type === "custom") && !message.trim()) return note("Text fehlt");
          const expires = until ? new Date(until).getTime() : null;
          const preset = QUICK.find((item) => item.type === type);
          void publish(type, preset?.title || (type === "event" ? "Event" : "Hinweis"), message || preset?.message || "", expires);
        }}
      >
        <h2 className="text-lg font-semibold">Eigener Status</h2>
        <select className="field mt-3" value={type} onChange={(e) => setType(e.target.value)}>
          <option value="event">Event</option>
          <option value="custom">Hinweis</option>
          <option value="restarting">Neustart</option>
          <option value="maintenance">Wartung</option>
          <option value="down">Down</option>
          <option value="online">Online</option>
        </select>
        <textarea className="field mt-2 min-h-20" maxLength={120} placeholder="Nachricht, max. 120 Zeichen" value={message} onChange={(e) => setMessage(e.target.value.slice(0, 120))} />
        <p className="mt-1 text-xs text-faint">{message.length}/120</p>
        <label className="mt-2 block text-sm">
          Gilt bis, optional
          <input className="field mt-1" type="datetime-local" value={until} onChange={(e) => setUntil(e.target.value)} />
        </label>
        <button className="btn-brand mt-4" type="submit">Status setzen</button>
      </form>
      <ul className="space-y-2">
        {recent.map((item, index) => (
          <li key={`${item.updated_at}-${index}`} className="text-sm text-muted">
            {formatWhen(item.updated_at)} · {item.updated_by || item.created_by || "Team"} · {item.type} · {item.message || item.title}
          </li>
        ))}
      </ul>
    </div>
  );
}

const PLATFORMS = [
  { id: "twitch", label: "Twitch" },
  { id: "youtube", label: "YouTube" },
  { id: "tiktok", label: "TikTok Live" },
  { id: "kick", label: "Kick" },
  { id: "other", label: "Sonstige" },
];

function streamLink(raw: string) {
  const value = raw.trim().replace(/\s+/g, "");
  if (!value) return "";
  return `https://${value.replace(/^(?:https?:\/\/)+/i, "").replace(/^\/+/, "")}`;
}

export function StreamDesk({ user, note }: { user: StaffSession; note: (text: string) => void }) {
  const live = useFbValue<LiveStream>("live_streams/active");
  const [platform, setPlatform] = useState("twitch");
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [name, setName] = useState(user.username);
  const [when, setWhen] = useState("now");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const mine = !live?.uid || live.uid === user.uid || user.role === "owner";

  useEffect(() => {
    void fbGet<LiveStream>(`live_streams/profiles/${user.uid}`).then((row) => {
      if (!row) return;
      if (row.platform) setPlatform(row.platform);
      if (row.url) setUrl(row.url);
      if (row.streamer_name) setName(row.streamer_name);
    }).catch(() => {});
  }, [user.uid]);

  async function goLive(event: FormEvent) {
    event.preventDefault();
    const link = streamLink(url);
    let host = "";
    try {
      host = new URL(link).hostname;
    } catch {
      host = "";
    }
    if (!host || host === "https" || !host.includes(".")) {
      const text = "Bitte einen vollständigen Link eintragen";
      setMsg({ ok: false, text });
      note(text);
      return;
    }
    if (title.length > 80) {
      const text = "Titel max. 80 Zeichen";
      setMsg({ ok: false, text });
      note(text);
      return;
    }
    const uid = user.uid || currentLogin()?.uid || "";
    if (!uid) {
      const text = "Die Anmeldung hat keine ID. Bitte neu einloggen und noch einmal live gehen.";
      setMsg({ ok: false, text });
      note(text);
      return;
    }
    const started = when === "now" || !start ? Date.now() : new Date(start).getTime();
    const ends = end ? new Date(end).getTime() : 0;
    const body: LiveStream = {
      streamer_name: name.trim() || user.username,
      platform,
      title: title.trim().slice(0, 80),
      url: link,
      started_at: started,
      is_live: true,
      created_by: user.username,
      uid,
    };
    if (ends > started) body.ends_at = ends;
    setBusy(true);
    setMsg(null);
    try {
      await fbSet("live_streams/active", body);
      await fbSet(`live_streams/profiles/${uid}`, {
        streamer_name: body.streamer_name,
        platform,
        url: body.url,
      }).catch(() => undefined);
      const self = await fbGet<{ notifyLive?: boolean }>(`staffUsers/${user.username}`).catch(() => null);
      if (self?.notifyLive !== false) {
        await fbSet(`live_streams/notices/${uid}`, {
          by: user.username,
          name: body.streamer_name,
          title: body.title,
          platform,
          url: body.url,
          ts: Date.now(),
        }).catch(() => undefined);
      }
      const text = "Du bist live. Der Hinweis steht jetzt auf der Startseite.";
      setMsg({ ok: true, text });
      note(text);
    } catch (err) {
      const text = err instanceof Error ? err.message : "Speichern fehlgeschlagen";
      setMsg({ ok: false, text });
      note(text);
    } finally {
      setBusy(false);
    }
  }

  async function stopLive() {
    if (!live?.is_live) return;
    setBusy(true);
    setMsg(null);
    try {
      await fbSet("live_streams/active", { ...live, is_live: false, uid: live.uid });
      const text = "Stream ist aus. Der Hinweis auf der Seite ist weg.";
      setMsg({ ok: true, text });
      note(text);
    } catch (err) {
      const text = err instanceof Error ? err.message : "Speichern fehlgeschlagen";
      setMsg({ ok: false, text });
      note(text);
    } finally {
      setBusy(false);
    }
  }

  const onAir = Boolean(live?.is_live);
  const platformLabel = PLATFORMS.find((item) => item.id === (live?.platform || platform))?.label || live?.platform || "Stream";

  return (
    <div className="stream-desk space-y-4">
      <section className={`stream-hero${onAir ? " is-on" : ""}`}>
        <header className="stream-hero-head">
          <div>
            <p className="stream-kicker">CREATOR CONTROL</p>
            <h2 className="stream-hero-title">Mein Stream</h2>
            <p className="stream-hero-copy">Steuere deinen Live-Auftritt und sieh direkt, wie er auf der Website wirkt.</p>
          </div>
          <span className={`stream-status-badge${onAir ? " is-on" : " is-off"}`} aria-live="polite">
            <i className="live-dot" aria-hidden="true" />
            {onAir ? "LIVE" : "OFFLINE"}
          </span>
        </header>

        <div className="stream-board">
        <div className="stream-panel">
          <div className="stream-control-head">
            <div>
              <p className="stream-control-label">LIVE-SCHALTER</p>
              <p className="stream-control-subtitle">Ein Zug startet oder beendet deinen Stream.</p>
            </div>
            <span className={`stream-control-state${busy ? " is-busy" : onAir ? " is-on" : ""}`}>
              {busy ? "SPEICHERT" : onAir ? "AKTIV" : "BEREIT"}
            </span>
          </div>
          <button
            type="button"
            className="stream-hook"
            data-on={onAir ? "1" : "0"}
            role="switch"
            aria-checked={onAir}
            aria-label={onAir ? "Stream beenden" : "Stream jetzt starten"}
            disabled={busy || (onAir && !mine)}
            onClick={() => {
              if (onAir) void stopLive();
              else {
                const form = document.getElementById("stream-form");
                if (form instanceof HTMLFormElement) form.requestSubmit();
              }
            }}
          >
            <span className="stream-hook-track" aria-hidden="true">
              <span className="stream-hook-knob" />
              <span className="stream-hook-track-label">{onAir ? "LIVE" : "GO"}</span>
            </span>
            <span className="stream-hook-copy">
              <strong>{busy ? "Einen Moment …" : onAir ? "Du bist live" : "Bereit zum Livegehen"}</strong>
              <span>{onAir ? "Nach links schieben, um zu beenden" : "Nach rechts schieben, um live zu gehen"}</span>
            </span>
          </button>
          <p className="stream-control-hint">
            {onAir && !mine
              ? `${live?.streamer_name || "Ein Teammitglied"} ist live. Nur diese Person oder der Owner kann den Stream beenden.`
              : busy
                ? "Deine Änderung wird gespeichert."
                : onAir
                  ? "Dein Live-Hinweis ist aktuell auf der Website sichtbar."
                  : "Deine Angaben kannst du unten vorbereiten. Live geht es erst mit dem Schalter."}
          </p>
        </div>
        <figure className="stream-frame">
          <figcaption>
            <span>VORSCHAU FÜR BESUCHER</span>
            <span className={`stream-preview-state${onAir ? " is-on" : ""}`}>{onAir ? "LIVE-KARTE" : "BEREIT"}</span>
          </figcaption>
          <div className={`stream-mini${onAir ? " is-on" : ""}`}>
            <div className="stream-mini-top">
              <span>ALPENSMP <b>·</b> COMMUNITY</span>
              <span className="stream-mini-live">{onAir ? "● ON AIR" : "STREAM PREVIEW"}</span>
            </div>
            <div className="stream-mini-content">
              <i className={`live-dot${onAir ? "" : " stream-dot-off"}`} aria-hidden="true" />
              <div className="min-w-0">
                <p className="stream-mini-kicker">{onAir ? `${platformLabel} · JETZT LIVE` : "DEIN NÄCHSTER STREAM"}</p>
                <p className="stream-mini-title">{onAir ? `${live?.streamer_name || name} streamt` : "Dein Stream erscheint hier"}</p>
                <p className="stream-mini-description">
                  {onAir
                    ? live?.title || "AlpenSMP"
                    : "Sobald du live gehst, sehen Besucher hier deinen Namen, Titel und Plattform."}
                </p>
              </div>
            </div>
            <div className="stream-mini-footer">
              <span>{onAir ? "LIVE AUF DER WEBSITE" : "VORSCHAU · NUR FÜR DICH"}</span>
              <span aria-hidden="true">↗</span>
            </div>
          </div>
        </figure>
        </div>
      </section>

      <form id="stream-form" className="card card-still stream-form" onSubmit={(event) => void goLive(event)}>
        <header className="stream-form-head">
          <div>
            <p className="stream-kicker">STREAM SETUP</p>
            <h2 className="stream-form-title">{onAir ? "Stream-Details" : "Stream vorbereiten"}</h2>
            <p className="stream-form-copy">Lege fest, was deine Community sieht, wenn du live bist.</p>
          </div>
          <span className="stream-form-step">01 <i>/</i> 01</span>
        </header>

        <div className="stream-fields">
          <label className="stream-field">
            <span>Anzeigename</span>
            <input className="field" value={name} onChange={(e) => setName(e.target.value)} placeholder={user.username} />
          </label>
          <label className="stream-field">
            <span>Plattform</span>
            <select className="field" value={platform} onChange={(e) => setPlatform(e.target.value)}>
              {PLATFORMS.map((item) => (
                <option key={item.id} value={item.id}>{item.label}</option>
              ))}
            </select>
          </label>
          <label className="stream-field stream-field-wide">
            <span className="stream-field-row">
              <span>Streamtitel</span>
              <span className="stream-char-count">{title.length}/80</span>
            </span>
            <input className="field" maxLength={80} value={title} onChange={(e) => setTitle(e.target.value.slice(0, 80))} placeholder="Woran arbeitest du heute?" />
          </label>
          <label className="stream-field stream-field-wide">
            <span>Stream-Link</span>
            <input className="field" placeholder="https://twitch.tv/deinname" value={url} onChange={(e) => setUrl(e.target.value)} />
          </label>
        </div>

        <fieldset className="stream-schedule">
          <legend>Wann startest du?</legend>
          <div className="stream-schedule-options">
            <button type="button" className={when === "now" ? "stream-schedule-choice is-active" : "stream-schedule-choice"} aria-pressed={when === "now"} onClick={() => setWhen("now")}>
              <span className="stream-schedule-icon" aria-hidden="true">●</span>
              <span><strong>Jetzt live</strong><small>Direkt ankündigen</small></span>
            </button>
            <button type="button" className={when === "later" ? "stream-schedule-choice is-active" : "stream-schedule-choice"} aria-pressed={when === "later"} onClick={() => setWhen("later")}>
              <span className="stream-schedule-icon" aria-hidden="true">◷</span>
              <span><strong>Später planen</strong><small>Startzeit festlegen</small></span>
            </button>
          </div>
          {when === "later" ? (
            <label className="stream-field stream-field-wide stream-date-field">
              <span>Geplanter Start</span>
              <input className="field" type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)} />
            </label>
          ) : null}
          <label className="stream-field stream-field-wide stream-date-field">
            <span>Ende <i>optional</i></span>
            <input className="field" type="datetime-local" value={end} onChange={(e) => setEnd(e.target.value)} />
          </label>
        </fieldset>

        {msg ? (
          <p className={`stream-feedback${msg.ok ? " is-ok" : " is-error"}`} role="status">
            <span aria-hidden="true">{msg.ok ? "✓" : "!"}</span>
            {msg.text}
          </p>
        ) : null}

        <footer className="stream-form-footer">
          <p>{onAir ? "Deine Änderungen werden direkt für den Stream übernommen." : "Du kannst den Stream auch mit dem Schalter oben starten."}</p>
          <button className="btn-brand stream-submit" type="submit" disabled={busy || (onAir && !mine)}>
            {busy ? "Wird gespeichert …" : onAir ? "Stream-Details aktualisieren" : "Jetzt live gehen"}
          </button>
        </footer>
      </form>
    </div>
  );
}

export function LiveNotices({ note }: { note: (text: string) => void }) {
  const rows = useFbValue<Record<string, { by?: string; name?: string; title?: string; ts?: number }>>("live_streams/notices");
  const list = groupLiveNotices(rows).slice(0, 5);
  if (!list.length) return null;

  async function removeNotice(ids: string[]) {
    try {
      await Promise.all(ids.map((id) => fbRemove(`live_streams/notices/${id}`)));
      note(ids.length > 1 ? "Doppelte Live-Hinweise entfernt" : "Hinweis weg");
    } catch (err) {
      note(err instanceof Error ? err.message : "Hinweis konnte nicht entfernt werden");
    }
  }

  return (
    <div className="mt-4 space-y-2">
      {list.map(({ key, ids, item }) => (
        <p key={key} className="flex items-center gap-2 rounded-md border border-line px-3 py-2 text-sm">
          <span className="min-w-0 flex-1">{item.name || item.by} ist live{item.title ? `: ${item.title}` : ""} · {formatWhen(item.ts)}</span>
          <button type="button" className="text-faint" aria-label="Live-Hinweis entfernen" onClick={() => void removeNotice(ids)}>
            ×
          </button>
        </p>
      ))}
    </div>
  );
}

export function SeasonDesk({ note }: { note: (text: string) => void }) {
  const saved = useFbValue<{ active?: string }>("season");
  const [pick, setPick] = useState("auto");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (saved?.active) setPick(saved.active);
  }, [saved?.active]);
  const preview = pick === "auto" ? autoSeason() : pick;
  const chosen = SEASONS.find((item) => item.key === preview);

  async function activate() {
    setBusy(true);
    try {
      await fbSet("season", { active: pick });
      window.dispatchEvent(new CustomEvent("alpen-season-pick", { detail: pick }));
      note(pick === "auto" ? "Saison folgt jetzt dem Datum" : "Season ist aktiv");
    } catch (err) {
      note(err instanceof Error ? err.message : "Speichern fehlgeschlagen");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="card card-still p-5">
      <h2 className="text-lg font-semibold">Season & Events</h2>
      <p className="mt-1 max-w-xl text-sm text-muted">Eine Karte wählen und aktivieren. Besucher sehen die neue Saison beim nächsten Laden, spätestens nach drei Minuten.</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <button
          type="button"
          className={`rounded-xl border px-3 py-3 text-left ${pick === "auto" ? "border-brand bg-brand/10" : "border-line bg-bg"}`}
          aria-pressed={pick === "auto"}
          onClick={() => setPick("auto")}
        >
          <span className="text-xl" aria-hidden="true">📅</span>
          <span className="mt-1 block font-semibold">Automatisch nach Datum</span>
          <span className="mt-1 block text-xs text-muted">Gerade: {chosen?.label || "Normal"}</span>
        </button>
        {SEASONS.filter((item) => item.key !== "default").map((item) => (
          <button
            key={item.key}
            type="button"
            className={`rounded-xl border px-3 py-3 text-left ${item.key === pick ? "border-brand bg-brand/10" : "border-line bg-bg"}`}
            aria-pressed={item.key === pick}
            onClick={() => setPick(item.key)}
          >
            <span className="mt-1 block font-semibold">{item.label}</span>
            <span className="mt-1 block text-xs text-muted">{item.months}</span>
          </button>
        ))}
        <button
          type="button"
          className={`rounded-xl border px-3 py-3 text-left ${pick === "default" ? "border-brand bg-brand/10" : "border-line bg-bg"}`}
          aria-pressed={pick === "default"}
          onClick={() => setPick("default")}
        >
          <span className="mt-1 block font-semibold">Normal</span>
          <span className="mt-1 block text-xs text-muted">Alpenrot, ohne Effekt</span>
        </button>
      </div>
      <div className="mt-4 flex items-center gap-4">
        <div className="w-24">
          <MascotView act="stand" gaze={{ x: 0, y: 0 }} season={preview} preview />
        </div>
        <p className="text-sm text-muted">Vorschau: {chosen?.label}. Outfit: {chosen?.mascotOutfit}. {chosen?.decorations}.</p>
      </div>
      <button type="button" className="btn-brand mt-3" disabled={busy} onClick={() => void activate()}>
        {busy ? "Speichere…" : "Aktivieren"}
      </button>
    </section>
  );
}
