import { useEffect, useMemo, useState, type FormEvent } from "react";
import { countdown, useFbValue, type LiveStream, type NewsCategory, type NewsItem, type ServerStatus } from "@/lib/alpen/broadcast";
import { fbGet, fbPush, fbRemove, fbSet, fbUpdate, formatWhen, type StaffSession } from "@/lib/alpen/staff";

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
    if (!host || host === "https" || !host.includes(".")) return note("Bitte einen vollständigen Link eintragen");
    if (title.length > 80) return note("Titel max. 80 Zeichen");
    const started = when === "now" || !start ? Date.now() : new Date(start).getTime();
    const ends = end ? new Date(end).getTime() : null;
    const body: LiveStream = {
      streamer_name: name.trim() || user.username,
      platform,
      title: title.trim().slice(0, 80),
      url: link,
      started_at: started,
      ends_at: ends,
      is_live: true,
      created_by: user.username,
      uid: user.uid,
    };
    await fbSet(`live_streams/profiles/${user.uid}`, {
      streamer_name: body.streamer_name,
      platform,
      url: body.url,
    });
    await fbSet("live_streams/active", body);
    const self = await fbGet<{ notifyLive?: boolean }>(`staffUsers/${user.username}`).catch(() => null);
    if (self?.notifyLive !== false) {
      await fbPush("live_streams/notices", {
        by: user.username,
        name: body.streamer_name,
        title: body.title,
        platform,
        url: body.url,
        ts: Date.now(),
      }).catch(() => undefined);
    }
    note("Du bist live");
  }

  return (
    <div className="space-y-4">
      {live?.is_live ? (
        <p className="rounded-md border border-brand/40 bg-brand/10 px-4 py-3 text-sm">
          Live: {live.streamer_name} · {live.title || live.platform}
          {mine ? (
            <button type="button" className="btn-ghost ml-3" onClick={() => void fbSet("live_streams/active", { ...live, is_live: false, uid: live.uid }).then(() => note("Stream beendet"))}>
              Stream beenden
            </button>
          ) : null}
        </p>
      ) : null}
      <form className="card card-still p-5" onSubmit={(event) => void goLive(event)}>
        <h2 className="text-lg font-semibold">Stream ankündigen</h2>
        <label className="mt-3 block text-sm">
          Anzeigename
          <input className="field mt-1" value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label className="mt-3 block text-sm">
          Plattform
          <select className="field mt-1" value={platform} onChange={(e) => setPlatform(e.target.value)}>
            {PLATFORMS.map((item) => (
              <option key={item.id} value={item.id}>{item.label}</option>
            ))}
          </select>
        </label>
        <label className="mt-3 block text-sm">
          Titel
          <input className="field mt-1" maxLength={80} value={title} onChange={(e) => setTitle(e.target.value.slice(0, 80))} />
        </label>
        <p className="text-xs text-faint">{title.length}/80</p>
        <label className="mt-3 block text-sm">
          Link
          <input className="field mt-1" placeholder="https://" value={url} onChange={(e) => setUrl(e.target.value)} />
        </label>
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" className={when === "now" ? "btn-brand" : "btn-ghost"} onClick={() => setWhen("now")}>Jetzt live</button>
          <button type="button" className={when === "later" ? "btn-brand" : "btn-ghost"} onClick={() => setWhen("later")}>Zeitpunkt wählen</button>
        </div>
        {when === "later" ? <input className="field mt-2" type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)} /> : null}
        <label className="mt-3 block text-sm">
          Ende, optional
          <input className="field mt-1" type="datetime-local" value={end} onChange={(e) => setEnd(e.target.value)} />
        </label>
        <button className="btn-brand mt-4" type="submit">Live gehen</button>
      </form>
    </div>
  );
}

export function LiveNotices({ note }: { note: (text: string) => void }) {
  const rows = useFbValue<Record<string, { by?: string; name?: string; title?: string; ts?: number }>>("live_streams/notices");
  const list = Object.entries(rows ?? {}).sort((a, b) => (b[1].ts || 0) - (a[1].ts || 0)).slice(0, 5);
  if (!list.length) return null;
  return (
    <div className="mt-4 space-y-2">
      {list.map(([id, item]) => (
        <p key={id} className="rounded-md border border-line px-3 py-2 text-sm">
          {item.name || item.by} ist live{item.title ? `: ${item.title}` : ""} · {formatWhen(item.ts)}
          <button type="button" className="ml-2 text-faint" onClick={() => void fbRemove(`live_streams/notices/${id}`).then(() => note("Hinweis weg"))}>
            ×
          </button>
        </p>
      ))}
    </div>
  );
}
