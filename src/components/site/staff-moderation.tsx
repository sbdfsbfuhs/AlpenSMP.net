import { useMemo, useState, type FormEvent, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { archive, useLive, wipe } from "@/components/site/staff-live";
import { Neu } from "@/components/site/staff-shared";
import { suggestMinecraftPlayers } from "@/lib/alpen/minecraft";
import {
  entries,
  executeMinecraftBan,
  fbGet,
  fbPush,
  fbSet,
  fbUpdate,
  formatRemaining,
  formatWhen,
  freshStamp,
  isPermanentBan,
  logStaff,
  hasMinecraftBanReason,
  minecraftBanKey,
  parseDuration,
  permLeft,
  type MinecraftBan,
  type ModItem,
  type StaffSession,
} from "@/lib/alpen/staff";

type Filter = "active" | "expired" | "archived" | "all";

export function Moderation({ user, note, ban, writeNotes, players, minecraftBans }: { user: StaffSession; note: (text: string) => void; ban: boolean; writeNotes: boolean; players: string[]; minecraftBans: MinecraftBan[] }) {
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
  const counts = { bans: entries(bans).length, warns: entries(warns).length, notes: entries(notes).length };
  return (
    <div className="space-y-4">
      {modes.length > 1 ? (
        <div className="flex flex-wrap gap-2" role="group" aria-label="Moderationsbereich">
          {modes.map(([id, label]) => (
            <button key={id} type="button" className={id === active ? "btn-brand px-3" : "btn-ghost px-3"} onClick={() => setKind(id)}>
              {label} <span className="ml-1 text-xs opacity-70">{counts[id]}</span>
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
          minecraftBans={minecraftBans}
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
  minecraftBans,
}: {
  title: string;
  path: string;
  user: StaffSession;
  note: (text: string) => void;
  withDuration?: boolean;
  presets?: string[];
  players: string[];
  minecraftBans: MinecraftBan[];
}) {
  const [name, setName] = useState("");
  const [reason, setReason] = useState("");
  const [duration, setDuration] = useState("");
  const [formError, setFormError] = useState("");
  const [confirmBan, setConfirmBan] = useState<{ name: string; reason: string; duration: string } | null>(null);
  const [sendingBan, setSendingBan] = useState(false);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const known = useLive<ModItem>(path);
  const guide = useLive<{ offense?: string; duration?: string }>("banGuide");
  const needle = name.trim().toLocaleLowerCase();
  const knownNames = useMemo(
    () => entries(known).flatMap(([, item]) => item.name ? [item.name] : []),
    [known],
  );
  const playerNames = useMemo(
    () => [...players, ...minecraftBans.map((item) => item.name), ...knownNames],
    [knownNames, minecraftBans, players],
  );
  const suggestions = useMemo(
    () => name.trim() ? suggestMinecraftPlayers(name, playerNames) : [],
    [name, playerNames],
  );
  const bansNeedingReason = useMemo(
    () => path === "bans"
      ? minecraftBans.filter((minecraftBan) => {
        if (hasMinecraftBanReason(minecraftBan.reason)) return false;
        return !entries(known).some(([, item]) =>
          item.minecraftBanKey === minecraftBanKey(minecraftBan) && hasMinecraftBanReason(item.reason),
        );
      })
      : [],
    [known, minecraftBans, path],
  );
  const past = withDuration && needle.length >= 2
    ? entries(known).filter(([, item]) => (item.name || "").toLowerCase().includes(needle))
    : [];
  const guideRows = entries(guide).filter(([, item]) => item.offense && item.duration);
  const selectedBan = path === "bans"
    ? minecraftBans.find((item) => item.name.toLowerCase() === needle)
    : undefined;
  const selectedRecord = selectedBan
    ? entries(known).find(([, item]) => item.minecraftBanKey === minecraftBanKey(selectedBan))?.[1]
    : undefined;
  const serverReason = selectedBan && hasMinecraftBanReason(selectedBan.reason) ? selectedBan.reason.trim() : "";
  const savedReason = selectedRecord && hasMinecraftBanReason(selectedRecord.reason) ? selectedRecord.reason?.trim() || "" : "";
  const displayedReason = serverReason || savedReason || reason;
  const canEditReason = path !== "bans" || (!serverReason && !savedReason);

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
    setFormError("");
    if (!name.trim()) return setFormError("Name fehlt.");
    if (path === "bans" && !/^\.?[A-Za-z0-9_]{1,16}$/.test(name.trim())) return setFormError("Ungültiger Minecraft-Spielername.");
    if (withDuration && !duration.trim() && !selectedBan) return setFormError("Dauer wählen.");
    if (path === "bans" && !hasMinecraftBanReason(displayedReason)) return setFormError("Bitte gib einen konkreten Bann-Grund an.");
    const body: ModItem = {
      name: name.trim(),
      reason: displayedReason.trim() || "–",
      by: user.username,
      ts: Date.now(),
    };
    if (withDuration) {
      body.duration = duration.trim();
      body.endsAt = parseDuration(body.duration);
      if (path === "bans" && !selectedBan && !isPermanentBan({ duration: body.duration, endsAt: body.endsAt }) && !/^(?:[1-9]\d*[smhdw])+$/i.test(body.duration)) {
        return setFormError("Ungültige Dauer. Verwende Permanent oder zum Beispiel 1d, 12h oder 30m.");
      }
      if (path === "bans" && !selectedBan && isPermanentBan({ duration: body.duration, endsAt: body.endsAt }) && user.role !== "owner") {
        body.pending = true;
      }
    }
    if (path === "bans") {
      if (!selectedBan) {
        setConfirmBan({ name: name.trim(), reason: reason.trim(), duration: duration.trim() });
        return;
      }
      const finalReason = serverReason || savedReason || reason.trim();
      if (!hasMinecraftBanReason(finalReason)) return setFormError("Bitte ergänze einen konkreten Bann-Grund.");
      const createdAt = selectedBan.created && Number.isFinite(Date.parse(selectedBan.created)) ? Date.parse(selectedBan.created) : Date.now();
      const banKey = minecraftBanKey(selectedBan);
      body.name = selectedBan.name;
      body.reason = finalReason;
      body.duration = selectedBan.until && !/^(?:forever|never|permanent)$/i.test(selectedBan.until) && Number.isFinite(Date.parse(selectedBan.until))
        ? `bis ${formatWhen(Date.parse(selectedBan.until))}`
        : "Permanent";
      body.endsAt = selectedBan.until && !/^(?:forever|never|permanent)$/i.test(selectedBan.until) && Number.isFinite(Date.parse(selectedBan.until))
        ? Date.parse(selectedBan.until)
        : null;
      body.minecraftBanKey = banKey;
      if (selectedBan.uuid) body.minecraftUuid = selectedBan.uuid;
      if (selectedBan.created) body.minecraftCreated = selectedBan.created;
      if (selectedBan.source) body.minecraftSource = selectedBan.source;
      if (selectedBan.until) body.minecraftExpires = selectedBan.until;
      body.reasonSource = serverReason ? "minecraft" : "staff";
      body.reasonAddedAt = serverReason ? createdAt : savedReason ? selectedRecord?.reasonAddedAt || Date.now() : Date.now();
      body.updatedAt = Date.now();
      try {
        const rows = await fbGet<Record<string, ModItem>>("bans") || {};
        const existing = Object.entries(rows).find(([, item]) => item.minecraftBanKey === banKey);
        if (existing) {
          await fbUpdate(`bans/${existing[0]}`, body);
        } else {
          const safeKey = [...banKey].map((character) => character.codePointAt(0)?.toString(16) || "0").join("_");
          await fbSet(`bans/minecraft_${safeKey}`, body);
        }
      } catch (error) {
        return setFormError(error instanceof Error ? error.message : "Speichern fehlgeschlagen.");
      }
      void logStaff(user.username, "Banngrund ergänzt", `${selectedBan.name} · ${finalReason}`);
      setName("");
      setReason("");
      setDuration("");
      note("Banngrund im Staff-Center gespeichert");
      return;
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
        <label htmlFor="moderation-player-name" className="mb-1 block text-sm font-medium">Spielername</label>
        <input
          id="moderation-player-name"
          className="field"
          placeholder={path === "bans" ? "Minecraft-Spieler suchen" : "Spieler für die Verwarnung suchen"}
          value={name}
          autoComplete={path === "bans" ? "off" : undefined}
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={suggestionsOpen}
          aria-controls="minecraft-player-suggestions"
          aria-activedescendant={activeSuggestion >= 0 ? `minecraft-player-option-${activeSuggestion}` : undefined}
          onChange={(event) => {
            setName(event.target.value);
            setActiveSuggestion(-1);
            setSuggestionsOpen(true);
          }}
          onFocus={() => setSuggestionsOpen(Boolean(name.trim()))}
          onBlur={() => window.setTimeout(() => setSuggestionsOpen(false), 100)}
          onKeyDown={handlePlayerKeyDown}
        />
        {suggestionsOpen ? (
          <ul id="minecraft-player-suggestions" role="listbox" className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-md border border-line bg-surface p-1 shadow-xl">
            {suggestions.length ? suggestions.map((player, index) => (
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
            )) : (
              <li className="px-3 py-2 text-sm text-muted">Keine Treffer – du kannst den Namen manuell eingeben.</li>
            )}
          </ul>
        ) : null}
      </div>
      <p className="mt-1 text-xs text-faint">Vorschläge aus Spielerliste, aktiven Banns und bisherigen Moderationseinträgen.</p>
      {bansNeedingReason.length ? (
        <section className="mt-4 rounded-lg border border-amber-500/30 bg-amber-950/15 p-3" aria-labelledby="bans-needing-reason-title">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 id="bans-needing-reason-title" className="text-sm font-semibold">Ingame-Banns eintragen</h3>
            <span className="text-xs text-muted">{bansNeedingReason.length} ohne eindeutigen Grund</span>
          </div>
          <p className="mt-1 text-xs text-muted">Spieler auswählen, dann einen konkreten Grund ergänzen.</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {bansNeedingReason.slice(0, 8).map((minecraftBan) => (
              <button
                key={minecraftBanKey(minecraftBan)}
                type="button"
                className={name.toLocaleLowerCase() === minecraftBan.name.toLocaleLowerCase() ? "btn-brand px-3" : "btn-ghost px-3"}
                aria-pressed={name.toLocaleLowerCase() === minecraftBan.name.toLocaleLowerCase()}
                onClick={() => choosePlayer(minecraftBan.name)}
              >
                {minecraftBan.name}
              </button>
            ))}
          </div>
        </section>
      ) : null}
      {path === "bans" && name.trim() ? (
        <p className="mt-2 text-sm text-muted">
          {selectedBan ? (hasMinecraftBanReason(selectedBan.reason) ? "Aktiver Ingame-Bann gefunden." : "Aktiver Ingame-Bann gefunden – bitte einen konkreten Grund ergänzen.") : "Noch nicht ingame gebannt – beim Eintragen kannst du den Ingame-Bann bestätigen."}
        </p>
      ) : null}
      <label className="mt-3 block text-sm font-medium">
        {path === "bans" ? "Konkreter Grund" : "Grund der Verwarnung"}
        <input className="field mt-1" placeholder={path === "bans" ? "z. B. X-Ray beim Mining" : "Was ist vorgefallen?"} value={displayedReason} onChange={(e) => setReason(e.target.value)} readOnly={!canEditReason} required={path !== "bans" || !hasMinecraftBanReason(selectedBan?.reason)} />
      </label>
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
      {withDuration ? (
        <label className="mt-3 block text-sm font-medium">
          Dauer
          <input className="field mt-1" placeholder="Eigene Dauer, z. B. 12h" value={duration} onChange={(e) => setDuration(e.target.value)} />
        </label>
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
      {formError ? <p className="mt-3 text-sm text-ember" role="alert">{formError}</p> : null}
      {confirmBan ? (
        <div className="fixed inset-0 z-[90] grid place-items-center bg-black/70 p-4">
          <section className="card card-still w-full max-w-md p-5 shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="minecraft-ban-confirm-title">
            <h2 id="minecraft-ban-confirm-title" className="text-lg font-semibold">Spieler ist noch nicht ingame gebannt</h2>
            <p className="mt-2 text-sm text-muted">
              Soll das Control Center <strong>{confirmBan.name}</strong> jetzt { /^(?:permanent|perm|∞)$/i.test(confirmBan.duration) ? "permanent" : `für ${confirmBan.duration}` } bannen?
            </p>
            <p className="mt-2 text-sm text-muted">Grund: {confirmBan.reason}</p>
            {formError ? <p className="mt-3 text-sm text-ember" role="alert">{formError}</p> : null}
            <div className="mt-4 flex flex-wrap justify-end gap-2">
              <button type="button" className="btn-ghost px-3" disabled={sendingBan} onClick={() => { setConfirmBan(null); setFormError(""); }}>Nein, abbrechen</button>
              <button
                type="button"
                className="btn-brand px-3"
                disabled={sendingBan}
                onClick={async () => {
                  if (!confirmBan) return;
                  setSendingBan(true);
                  setFormError("");
                  try {
                    const result = await executeMinecraftBan(confirmBan);
                    setConfirmBan(null);
                    setName("");
                    setReason("");
                    setDuration("");
                    void logStaff(user.username, "Minecraft-Bann", `${confirmBan.name} · ${confirmBan.duration} · ${confirmBan.reason}`);
                    note(result.action === "tempban" ? "Tempban ausgeführt; die Website synchronisiert ihn automatisch." : "Permanent gebannt; die Website synchronisiert ihn automatisch.");
                  } catch (error) {
                    setFormError(error instanceof Error ? error.message : "Minecraft-Bann fehlgeschlagen.");
                  } finally {
                    setSendingBan(false);
                  }
                }}
              >
                {sendingBan ? "Banne…" : "Ja, jetzt bannen"}
              </button>
            </div>
          </section>
        </div>
      ) : null}
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
  const counts = useMemo(() => {
    let activeCount = 0;
    let expiredCount = 0;
    let archivedCount = 0;
    for (const [, item] of items) {
      if (item.archived) archivedCount += 1;
      else if (item.endsAt && item.endsAt <= Date.now()) expiredCount += 1;
      else activeCount += 1;
    }
    return { active: activeCount, expired: expiredCount, archived: archivedCount, all: items.length };
  }, [items]);
  const rows = useMemo(() => {
    return items.filter(([, item]) => {
      const expired = Boolean(item.endsAt && item.endsAt <= Date.now());
      let matchesFilter = true;
      if (!notes) {
        if (filter === "archived") matchesFilter = Boolean(item.archived);
        else if (filter === "expired") matchesFilter = !item.archived && expired;
        else if (filter === "active") matchesFilter = !item.archived && !expired;
      }
      const blob = `${item.name || ""} ${item.reason || ""} ${item.text || ""} ${item.by || ""}`.toLowerCase();
      return matchesFilter && blob.includes(q.trim().toLowerCase());
    }).sort(([, a], [, b]) => (b.updatedAt || b.ts || 0) - (a.updatedAt || a.ts || 0));
  }, [items, filter, q, notes]);

  return (
    <section className="card card-still p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">{title}</h2>
        {!notes ? (
          <div className="flex flex-wrap gap-1">
            {(["active", "expired", "archived", "all"] as Filter[]).map((item) => (
              <button key={item} type="button" className={item === filter ? "btn-brand px-3" : "btn-ghost px-3"} onClick={() => setFilter(item)}>
                {item === "active" ? "Aktiv" : item === "expired" ? "Abgelaufen" : item === "archived" ? "Archiv" : "Alle"} <span className="ml-1 text-xs opacity-70">{counts[item]}</span>
              </button>
            ))}
          </div>
        ) : null}
      </div>
      <input className="field mt-3" placeholder="Spieler, Grund oder Teammitglied suchen" value={q} onChange={(e) => setQ(e.target.value)} />
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
      <p className="mt-2 text-xs text-faint">{rows.length} von {items.length} Einträgen · neueste zuerst</p>
    </section>
  );
}
