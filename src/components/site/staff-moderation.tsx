import { useMemo, useState, type FormEvent } from "react";
import { archive, useLive, wipe } from "@/components/site/staff-live";
import { Neu } from "@/components/site/staff-shared";
import {
  entries,
  fbPush,
  fbUpdate,
  formatRemaining,
  formatWhen,
  freshStamp,
  isPermanentBan,
  logStaff,
  parseDuration,
  permLeft,
  type ModItem,
  type StaffSession,
} from "@/lib/alpen/staff";

type Filter = "active" | "expired" | "archived" | "all";

export function Moderation({ user, note, ban, writeNotes }: { user: StaffSession; note: (text: string) => void; ban: boolean; writeNotes: boolean }) {
  const bans = useLive<ModItem>("bans");
  const warns = useLive<ModItem>("warns");
  const notes = useLive<ModItem>("notes");
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {ban ? <ModForm title="Ban" path="bans" user={user} note={note} withDuration presets={["5min", "1h", "1d", "7d", "30d", "Permanent"]} reasons={[["Griefing", "1d"], ["Beleidigung", "7d"], ["Cheating", "30d"]]} /> : null}
      <List title="Bans" path="bans" items={entries(bans)} user={user} note={note} timed write={ban} />
      {ban ? <ModForm title="Warnung" path="warns" user={user} note={note} withDuration presets={["1d", "7d", "30d"]} /> : null}
      <List title="Warnungen" path="warns" items={entries(warns)} user={user} note={note} timed write={ban} />
      {writeNotes ? <NoteForm user={user} note={note} /> : null}
      <List title="Notizen" path="notes" items={entries(notes)} user={user} note={note} notes write={writeNotes} />
    </div>
  );
}

function ModForm({
  title,
  path,
  user,
  note,
  withDuration,
  presets,
  reasons,
}: {
  title: string;
  path: string;
  user: StaffSession;
  note: (text: string) => void;
  withDuration?: boolean;
  presets?: string[];
  reasons?: [string, string][];
}) {
  const [name, setName] = useState("");
  const [reason, setReason] = useState("");
  const [duration, setDuration] = useState(withDuration ? (path === "warns" ? "7d" : "Permanent") : "");
  const [proof, setProof] = useState("");
  const known = useLive<ModItem>(path);
  const guide = useLive<{ offense?: string; duration?: string }>("banGuide");
  const needle = name.trim().toLowerCase();
  const past = withDuration && needle.length >= 2
    ? entries(known).filter(([, item]) => (item.name || "").toLowerCase().includes(needle))
    : [];
  const reasonNeedle = reason.trim().toLowerCase();
  const tips = withDuration && reasonNeedle.length >= 3
    ? entries(guide).filter(([, item]) => {
      const offense = (item.offense || "").toLowerCase();
      return offense && (offense.includes(reasonNeedle) || reasonNeedle.includes(offense));
    })
    : [];

  async function save(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) return note("Name fehlt");
    const body: ModItem = {
      name: name.trim(),
      reason: reason.trim() || "–",
      by: user.username,
      ts: Date.now(),
    };
    if (withDuration) {
      body.duration = duration.trim() || (path === "warns" ? "7d" : "Permanent");
      body.endsAt = parseDuration(body.duration);
      if (path === "bans" && isPermanentBan({ duration: body.duration, endsAt: body.endsAt })) {
        body.pending = true;
      }
    }
    if (path === "bans" && proof.trim()) body.proof = proof.trim().slice(0, 500);
    await fbPush(path, body);
    void logStaff(user.username, title, `${name.trim()} · ${reason.trim() || "–"}`);
    setName("");
    setReason("");
    setProof("");
    note(body.pending ? "Ban wartet auf eine zweite Person" : `${title} gespeichert`);
  }

  return (
    <form className="card card-still p-5" onSubmit={save}>
      <h2 className="text-lg font-semibold">{title}</h2>
      <input className="field mt-3" placeholder="Spieler" value={name} onChange={(e) => setName(e.target.value)} />
      <input className="field mt-2" placeholder="Grund" value={reason} onChange={(e) => setReason(e.target.value)} />
      {withDuration ? <input className="field mt-2" placeholder="Dauer" value={duration} onChange={(e) => setDuration(e.target.value)} /> : null}
      {path === "bans" ? <input className="field mt-2" placeholder="Beweis-Link, optional" value={proof} onChange={(e) => setProof(e.target.value)} /> : null}
      {presets ? (
        <div className="mt-2 flex flex-wrap gap-2">
          {presets.map((item) => (
            <button key={item} type="button" className="btn-ghost px-3" onClick={() => setDuration(item)}>
              {item}
            </button>
          ))}
        </div>
      ) : null}
      {reasons ? (
        <div className="mt-2 flex flex-wrap gap-2">
          {reasons.map(([label, dur]) => (
            <button key={label} type="button" className="btn-ghost px-3" onClick={() => { setReason(label); setDuration(dur); }}>
              {label}
            </button>
          ))}
        </div>
      ) : null}
      {tips.length ? (
        <div className="mt-3 space-y-1 text-sm">
          <p className="text-muted">Passende Dauer aus dem Leitfaden</p>
          {tips.map(([key, item]) => (
            <button key={key} type="button" className="btn-ghost mr-2 mt-1 px-3" onClick={() => item.duration && setDuration(item.duration)}>
              {item.offense} · {item.duration}
            </button>
          ))}
        </div>
      ) : null}
      {past.length ? (
        <ul className="mt-3 space-y-1 text-sm">
          {past.slice(0, 5).map(([key, item]) => (
            <li key={key} className={isPermanentBan(item) ? "text-red-300" : "text-muted"}>
              Schon erfasst: {item.reason} · {item.duration || "ohne Dauer"} · {formatWhen(item.ts)}{item.archived ? " · archiviert" : ""}
            </li>
          ))}
        </ul>
      ) : null}
      <button className="btn-brand mt-4" type="submit">Eintragen</button>
    </form>
  );
}

function NoteForm({ user, note }: { user: StaffSession; note: (text: string) => void }) {
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  return (
    <form
      className="card card-still p-5"
      onSubmit={(event) => {
        event.preventDefault();
        if (!text.trim()) return note("Leer");
        void fbPush("notes", { name: name.trim(), text: text.trim(), by: user.username, ts: Date.now() }).then(() => {
          void logStaff(user.username, "Notiz", text.trim().slice(0, 80));
          setName("");
          setText("");
          note("Notiz gespeichert");
        });
      }}
    >
      <h2 className="text-lg font-semibold">Team-Notiz</h2>
      <input className="field mt-3" placeholder="Spieler" value={name} onChange={(e) => setName(e.target.value)} />
      <textarea className="field mt-2 min-h-24" placeholder="Notiz" value={text} onChange={(e) => setText(e.target.value)} />
      <button className="btn-brand mt-4" type="submit">Notiz speichern</button>
    </form>
  );
}

function List({
  title,
  path,
  items,
  user,
  note,
  timed,
  notes,
  write,
}: {
  title: string;
  path: string;
  items: [string, ModItem][];
  user: StaffSession;
  note: (text: string) => void;
  timed?: boolean;
  notes?: boolean;
  write?: boolean;
}) {
  const [filter, setFilter] = useState<Filter>(notes ? "all" : "active");
  const [q, setQ] = useState("");
  const rows = useMemo(() => {
    return items.filter(([, item]) => {
      const expired = Boolean(item.endsAt && item.endsAt <= Date.now());
      if (!notes) {
        if (filter === "archived") return Boolean(item.archived);
        if (filter === "expired") return !item.archived && expired;
        if (filter === "active") return !item.archived && !expired;
      }
      const blob = `${item.name || ""} ${item.reason || ""} ${item.text || ""} ${item.by || ""}`.toLowerCase();
      return blob.includes(q.trim().toLowerCase());
    });
  }, [items, filter, q, notes]);

  return (
    <section className="card card-still p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">{title}</h2>
        {!notes ? (
          <div className="flex flex-wrap gap-1">
            {(["active", "expired", "archived", "all"] as Filter[]).map((item) => (
              <button key={item} type="button" className={item === filter ? "btn-brand px-3" : "btn-ghost px-3"} onClick={() => setFilter(item)}>
                {item === "active" ? "Aktiv" : item === "expired" ? "Abgelaufen" : item === "archived" ? "Archiv" : "Alle"}
              </button>
            ))}
          </div>
        ) : null}
      </div>
      <input className="field mt-3" placeholder="Suchen" value={q} onChange={(e) => setQ(e.target.value)} />
      <ul className="mt-3 max-h-80 space-y-2 overflow-auto p-1">
        {rows.map(([key, item]) => {
          const perm = path === "bans" && isPermanentBan(item) && !item.archived;
          const waiting = Boolean(perm && item.pending);
          const proof = item.proof && /^https?:\/\//i.test(item.proof) ? item.proof : "";
          return (
          <li key={key} className={`cmd-in rounded-md border bg-bg px-3 py-2 text-sm${perm && !waiting ? " border-red-500 bg-red-950/40" : waiting ? " border-amber-500" : freshStamp(item.ts, item.updatedAt) ? " mark-new border-line" : " border-line"}`}>
            <p className={`font-semibold${perm && !waiting ? " text-red-200" : ""}`}>{notes ? item.name || item.text : item.name}<Neu ts={item.ts} updatedAt={item.updatedAt} /></p>
            {!notes ? <p className="text-muted">{item.reason}</p> : <p className="text-muted">{item.text}</p>}
            <p className="text-xs text-faint">
              {timed && !waiting ? formatRemaining(item.endsAt) : ""} {item.duration ? `· ${item.duration}` : ""} · {item.by} · {formatWhen(item.ts)}
            </p>
            {proof ? <a className="mt-1 inline-block text-xs text-brand" href={proof} target="_blank" rel="noreferrer">Beweis</a> : null}
            {waiting ? <p className="text-xs font-semibold text-amber-300">Wartet auf eine zweite Person. Noch nicht gültig.</p> : null}
            {perm && !waiting ? <p className="text-xs font-semibold text-red-300">{permLeft(item.confirmedAt || item.ts)}</p> : null}
            <div className="mt-2 flex flex-wrap gap-2">
              {waiting && write && item.by !== user.username ? (
                <button type="button" className="btn-brand px-3" onClick={() => void fbUpdate(`${path}/${key}`, { pending: false, confirmedBy: user.username, confirmedAt: Date.now(), updatedAt: Date.now() }).then(() => note("Ban gilt jetzt"))}>
                  Bestätigen
                </button>
              ) : null}
              {write && !item.archived && !waiting ? (
                <button type="button" className="btn-ghost px-3" onClick={() => void archive(path, key, user, note)}>
                  Archiv
                </button>
              ) : null}
              {user.role === "owner" ? (
                <button type="button" className="btn-ghost px-3" onClick={() => void wipe(path, key, note)}>
                  Löschen
                </button>
              ) : null}
            </div>
          </li>
          );
        })}
        {!rows.length ? <li className="text-sm text-muted">Keine Einträge</li> : null}
      </ul>
    </section>
  );
}

