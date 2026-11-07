import { useMemo, useState, type FormEvent, type KeyboardEvent as ReactKeyboardEvent } from "react";
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

export function Moderation({ user, note, ban, writeNotes, players }: { user: StaffSession; note: (text: string) => void; ban: boolean; writeNotes: boolean; players: string[] }) {
  const bans = useLive<ModItem>("bans");
  const warns = useLive<ModItem>("warns");
  const notes = useLive<ModItem>("notes");
  const [kind, setKind] = useState<"bans" | "warns" | "notes">("bans");
  const modes = [
    ["bans", "Bans"],
    ["warns", "Warnungen"],
    ["notes", "Notizen"],
  ] as const;
  const active = modes.some(([id]) => id === kind) ? kind : modes[0]?.[0] || "notes";
  const items = active === "bans" ? entries(bans) : active === "warns" ? entries(warns) : entries(notes);
  return (
    <div className="space-y-4">
      {modes.length > 1 ? (
        <div className="flex flex-wrap gap-2">
          {modes.map(([id, label]) => (
            <button key={id} type="button" className={id === active ? "btn-brand px-3" : "btn-ghost px-3"} onClick={() => setKind(id)}>
              {label}
            </button>
          ))}
        </div>
      ) : null}
      {active === "notes" ? (
        writeNotes ? <NoteForm user={user} note={note} /> : null
      ) : ban ? (
        <ModForm
          title={active === "bans" ? "Ban" : "Warnung"}
          path={active}
          user={user}
          note={note}
          withDuration
          presets={active === "bans" ? ["1h", "1d", "7d", "30d", "Permanent"] : ["1d", "7d", "30d"]}
          players={players}
        />
      ) : null}
      <List
        title={active === "bans" ? "Bans" : active === "warns" ? "Warnungen" : "Notizen"}
        path={active}
        items={items}
        user={user}
        note={note}
        timed={active !== "notes"}
        notes={active === "notes"}
        write={active === "notes" ? writeNotes : ban}
      />
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
  players,
}: {
  title: string;
  path: string;
  user: StaffSession;
  note: (text: string) => void;
  withDuration?: boolean;
  presets?: string[];
  players: string[];
}) {
  const [name, setName] = useState("");
  const [reason, setReason] = useState("");
  const [duration, setDuration] = useState("");
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const known = useLive<ModItem>(path);
  const guide = useLive<{ offense?: string; duration?: string }>("banGuide");
  const needle = name.trim().toLowerCase();
  const suggestions = useMemo(
    () => path === "bans" && needle
      ? players.filter((player) => player.toLowerCase().startsWith(needle)).slice(0, 8)
      : [],
    [needle, path, players],
  );
  const past = withDuration && needle.length >= 2
    ? entries(known).filter(([, item]) => (item.name || "").toLowerCase().includes(needle))
    : [];
  const guideRows = entries(guide).filter(([, item]) => item.offense && item.duration);

  function choosePlayer(player: string) {
    setName(player);
    setActiveSuggestion(-1);
    setSuggestionsOpen(false);
  }

  function handlePlayerKeyDown(event: ReactKeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      setSuggestionsOpen(false);
      setActiveSuggestion(-1);
      return;
    }
    if (!suggestions.length) return;
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      setSuggestionsOpen(true);
      setActiveSuggestion((current) => event.key === "ArrowDown"
        ? (current + 1) % suggestions.length
        : (current <= 0 ? suggestions.length - 1 : current - 1));
    } else if (event.key === "Enter" && suggestionsOpen && activeSuggestion >= 0) {
      event.preventDefault();
      choosePlayer(suggestions[activeSuggestion]);
    }
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) return note("Name fehlt");
    if (withDuration && !duration.trim()) return note("Dauer wählen");
    const body: ModItem = {
      name: name.trim(),
      reason: reason.trim() || "–",
      by: user.username,
      ts: Date.now(),
    };
    if (withDuration) {
      body.duration = duration.trim();
      body.endsAt = parseDuration(body.duration);
      if (path === "bans" && isPermanentBan({ duration: body.duration, endsAt: body.endsAt }) && user.role !== "owner") {
        body.pending = true;
      }
    }
    try {
      await fbPush(path, body);
    } catch (err) {
      return note(err instanceof Error ? err.message : "Speichern fehlgeschlagen");
    }
    void logStaff(user.username, title, `${name.trim()} · ${reason.trim() || "–"}`);
    setName("");
    setReason("");
    setDuration("");
    note(body.pending ? "Permanent wartet auf den Owner" : `${title} gespeichert`);
  }

  return (
    <form className="card card-still p-5" onSubmit={save}>
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="relative mt-3">
        <input
          className="field"
          placeholder="Spieler"
          value={name}
          autoComplete={path === "bans" ? "off" : undefined}
          role={path === "bans" ? "combobox" : undefined}
          aria-autocomplete={path === "bans" ? "list" : undefined}
          aria-expanded={path === "bans" ? suggestionsOpen && suggestions.length > 0 : undefined}
          aria-controls={path === "bans" ? "minecraft-player-suggestions" : undefined}
          aria-activedescendant={path === "bans" && activeSuggestion >= 0 ? `minecraft-player-option-${activeSuggestion}` : undefined}
          onChange={(event) => {
            setName(event.target.value);
            setActiveSuggestion(-1);
            setSuggestionsOpen(true);
          }}
          onFocus={() => setSuggestionsOpen(true)}
          onBlur={() => window.setTimeout(() => setSuggestionsOpen(false), 100)}
          onKeyDown={handlePlayerKeyDown}
        />
        {suggestionsOpen && suggestions.length ? (
          <ul id="minecraft-player-suggestions" role="listbox" className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-md border border-line bg-surface p-1 shadow-xl">
            {suggestions.map((player, index) => (
              <li key={player}>
                <button
                  id={`minecraft-player-option-${index}`}
                  type="button"
                  role="option"
                  aria-selected={activeSuggestion === index}
                  className={`w-full rounded px-3 py-2 text-left text-sm ${activeSuggestion === index ? "bg-brand/15 text-fg" : "text-muted hover:bg-surface-2 hover:text-fg"}`}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => choosePlayer(player)}
                >
                  {player}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      <input className="field mt-2" placeholder="Grund" value={reason} onChange={(e) => setReason(e.target.value)} />
      {presets ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {presets.map((item) => (
            <button key={item} type="button" className={duration === item ? "btn-brand px-3" : "btn-ghost px-3"} onClick={() => setDuration(item)}>
              {item}
            </button>
          ))}
        </div>
      ) : null}
      {guideRows.length && path === "bans" ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {guideRows.map(([key, item]) => (
            <button
              key={key}
              type="button"
              className="btn-ghost px-3"
              onClick={() => {
                setReason(item.offense || "");
                if (item.duration) setDuration(item.duration);
              }}
            >
              {item.offense} · {item.duration}
            </button>
          ))}
        </div>
      ) : null}
      {withDuration ? <input className="field mt-2" placeholder="Oder eigene Dauer, z. B. 12h" value={duration} onChange={(e) => setDuration(e.target.value)} /> : null}
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
          return (
          <li key={key} className={`cmd-in rounded-md border bg-bg px-3 py-2 text-sm${perm && !waiting ? " border-red-500 bg-red-950/40" : waiting ? " border-amber-500" : freshStamp(item.ts, item.updatedAt) ? " mark-new border-line" : " border-line"}`}>
            <p className={`font-semibold${perm && !waiting ? " text-red-200" : ""}`}>{notes ? item.name || item.text : item.name}<Neu ts={item.ts} updatedAt={item.updatedAt} /></p>
            {!notes ? <p className="text-muted">{item.reason}</p> : <p className="text-muted">{item.text}</p>}
            <p className="text-xs text-faint">
              {timed && !waiting ? formatRemaining(item.endsAt) : ""} {item.duration ? `· ${item.duration}` : ""} · {item.by} · {formatWhen(item.ts)}
            </p>
            {waiting ? <p className="text-xs font-semibold text-amber-300">Permanent. Wartet auf den Owner.</p> : null}
            {perm && !waiting ? <p className="text-xs font-semibold text-red-300">{permLeft(item.confirmedAt || item.ts)}</p> : null}
            <div className="mt-2 flex flex-wrap gap-2">
              {waiting && user.role === "owner" ? (
                <button type="button" className="btn-brand px-3" onClick={() => void fbUpdate(`${path}/${key}`, { pending: false, confirmedBy: user.username, confirmedAt: Date.now(), updatedAt: Date.now() }).then(() => note("Ban gilt jetzt")).catch((err) => note(err instanceof Error ? err.message : "Bestätigen fehlgeschlagen"))}>
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
