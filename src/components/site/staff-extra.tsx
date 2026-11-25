import { useEffect, useState, type FormEvent } from "react";
import { MASCOT_DEFAULT, type Act, type MascotMode, type MascotSettings } from "@/lib/alpen/mascot";
import { can, type Area } from "@/lib/alpen/roles";
import { MascotView } from "@/components/site/mascot-art";
import { useLive } from "@/components/site/staff-live";
import { entries, fbGet, fbPush, fbRemove, fbSet, fbUpdate, formatWhen, freshStamp } from "@/lib/alpen/staff";

type Note = (text: string) => void;
const BUILDER_DIRECTORY_QUERY = { orderBy: "role", equalTo: "builder" } as const;

function guard(real: string, area: Area, note: Note) {
  if (can(real, area)) return true;
  note("Deine echte Rolle darf das nicht");
  return false;
}

export function RulesEditor({ real, view, note, staff }: { real: string; view: string; note: Note; staff?: boolean }) {
  const path = staff ? "rulesStaff" : "rulesPublic";
  const rows = useLive<{ title?: string; body?: string; ts?: number }>(path);
  const edit = can(view, "rulesEdit");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [open, setOpen] = useState<string | null>(null);

  return (
    <section className="card card-still p-5">
      <h2 className="text-lg font-semibold">{staff ? "Staff-Regeln" : "Öffentliche Regeln"}</h2>
      {edit ? (
        <form
          className="mt-3 grid gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            if (!guard(real, "rulesEdit", note) || !title.trim()) return;
            void fbPush(path, { title: title.trim(), body: body.trim(), ts: Date.now() }).then(() => {
              setTitle("");
              setBody("");
              note("Regel gespeichert");
            });
          }}
        >
          <input className="field" placeholder="Titel" value={title} onChange={(e) => setTitle(e.target.value)} />
          <textarea className="field min-h-24" placeholder="Text" value={body} onChange={(e) => setBody(e.target.value)} />
          <button className="btn-brand" type="submit">Abschnitt speichern</button>
        </form>
      ) : (
        <p className="mt-2 text-sm text-muted">Nur lesen.</p>
      )}
      <div className="mt-4 space-y-2">
        {entries(rows).map(([key, item]) => (
          <article key={key} className="rounded-md border border-line">
            <button type="button" className="flex w-full items-center justify-between px-3 py-2 text-left text-sm font-semibold" onClick={() => setOpen(open === key ? null : key)}>
              {item.title}
              <span className="text-faint">{open === key ? "–" : "+"}</span>
            </button>
            {open === key ? <p className="px-3 pb-3 text-sm whitespace-pre-line text-muted">{item.body}</p> : null}
            {edit ? (
              <button
                type="button"
                className="btn-ghost m-3 px-3"
                onClick={() => {
                  if (!guard(real, "rulesEdit", note)) return;
                  void fbRemove(`${path}/${key}`).then(() => note("Abschnitt entfernt"));
                }}
              >
                Löschen
              </button>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}

export function BanGuideEditor({ real, view, note }: { real: string; view: string; note: Note }) {
  const rows = useLive<{ offense?: string; duration?: string; command?: string }>("banGuide");
  const edit = can(view, "banGuideEdit");
  const [offense, setOffense] = useState("");
  const [duration, setDuration] = useState("");
  const [command, setCommand] = useState("");

  return (
    <section className="card card-still p-5">
      <h2 className="text-lg font-semibold">Ban-Leitfaden</h2>
      <p className="mt-1 text-sm text-muted">Zeiten stellt der Owner. Vorhandene Bans bleiben unangetastet.</p>
      {edit ? (
        <form
          className="mt-3 grid gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            if (!guard(real, "banGuideEdit", note) || !offense.trim()) return;
            void fbPush("banGuide", { offense: offense.trim(), duration: duration.trim(), command: command.trim(), ts: Date.now() }).then(() => {
              setOffense("");
              setDuration("");
              setCommand("");
              note("Leitfaden gespeichert");
            });
          }}
        >
          <input className="field" placeholder="Vergehen" value={offense} onChange={(e) => setOffense(e.target.value)} />
          <input className="field" placeholder="Dauer, z. B. 7d" value={duration} onChange={(e) => setDuration(e.target.value)} />
          <input className="field" placeholder="Befehl" value={command} onChange={(e) => setCommand(e.target.value)} />
          <button className="btn-brand" type="submit">Eintragen</button>
        </form>
      ) : null}
      <ul className="mt-4 space-y-2 text-sm">
        {entries(rows).map(([key, item]) => (
          <li key={key} className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-line px-3 py-2">
            <span>{item.offense} · {item.duration} · <code className="text-brand">{item.command}</code></span>
            {edit ? (
              <button type="button" className="btn-ghost px-3" onClick={() => guard(real, "banGuideEdit", note) && void fbRemove(`banGuide/${key}`).then(() => note("Entfernt"))}>
                Löschen
              </button>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}

type TaskItem = {
  title?: string;
  text?: string;
  by?: string;
  assignee?: string;
  scope?: string;
  status?: string;
  acceptedBy?: string;
  acceptedAt?: number;
  archivedAt?: number;
  note?: string;
  question?: string;
  reply?: string;
  due?: string;
  ts?: number;
  updatedAt?: number;
  done?: boolean;
};

type TaskState = "archived" | "active" | "open";
type TaskFilter = "all" | "mine" | "open" | "active";

function taskState(item: TaskItem): TaskState {
  if (item.status === "archived" || item.done) return "archived";
  if (item.status === "active") return "active";
  return "open";
}

function taskIsRelevantTo(item: TaskItem, username: string, real: string) {
  if (real === "owner") return true;
  if (item.acceptedBy) return item.acceptedBy === username;
  return !item.assignee || item.assignee === username || item.scope === "all";
}

function taskMatchesSearch(item: TaskItem, query: string) {
  if (!query) return true;
  return [item.title, item.text, item.by, item.assignee, item.acceptedBy, item.note, item.question, item.reply]
    .filter(Boolean)
    .join(" ")
    .toLocaleLowerCase()
    .includes(query);
}

export function TasksBoard({ real, view, note, username }: { real: string; view: string; note: Note; username: string }) {
  const rows = useLive<TaskItem>("tasks");
  const people = useLive<{ role?: string }>("staffDirectory");
  const edit = can(view, "tasks");
  const lead = real === "owner" || real === "admin";
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [scope, setScope] = useState(lead ? "all" : "one");
  const [assignee, setAssignee] = useState(username);
  const [due, setDue] = useState("");
  const [filter, setFilter] = useState<TaskFilter>(lead ? "all" : "mine");
  const [query, setQuery] = useState("");
  const [saving, setSaving] = useState(false);
  const today = localDateKey();
  const members = [...new Set([username, ...entries(people).map(([name]) => name)])]
    .sort((first, second) => first.localeCompare(second, "de"));
  const allRows = entries(rows);
  const activeRows = allRows
    .filter(([, item]) => taskState(item) !== "archived")
    .sort(([, first], [, second]) => {
      const firstDue = first.due || "9999-12-31";
      const secondDue = second.due || "9999-12-31";
      return firstDue.localeCompare(secondDue) || (second.updatedAt || second.ts || 0) - (first.updatedAt || first.ts || 0);
    });
  const archivedRows = allRows
    .filter(([, item]) => taskState(item) === "archived")
    .sort(([, first], [, second]) => (second.archivedAt || second.updatedAt || 0) - (first.archivedAt || first.updatedAt || 0));
  const counts = {
    all: activeRows.length,
    mine: activeRows.filter(([, item]) => taskIsRelevantTo(item, username, real)).length,
    open: activeRows.filter(([, item]) => taskState(item) === "open").length,
    active: activeRows.filter(([, item]) => taskState(item) === "active").length,
  };
  const search = query.trim().toLocaleLowerCase();
  const visibleRows = activeRows.filter(([, item]) => {
    if (filter === "open" && taskState(item) !== "open") return false;
    if (filter === "active" && taskState(item) !== "active") return false;
    if (filter === "mine" && !taskIsRelevantTo(item, username, real)) return false;
    return taskMatchesSearch(item, search);
  });
  const visibleArchived = archivedRows.filter(([, item]) => taskMatchesSearch(item, search));

  async function createTask(event: FormEvent) {
    event.preventDefault();
    if (!guard(real, "tasks", note) || !title.trim() || saving) return;
    setSaving(true);
    const forAll = lead && scope === "all";
    try {
      await fbPush("tasks", {
        title: title.trim(),
        text: text.trim(),
        by: username,
        scope: forAll ? "all" : "one",
        assignee: forAll ? "" : assignee || username,
        due,
        status: "open",
        done: false,
        ts: Date.now(),
      });
      setTitle("");
      setText("");
      setDue("");
      note("Aufgabe liegt bereit");
    } catch (error) {
      note(error instanceof Error ? error.message : "Aufgabe konnte nicht gespeichert werden");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="space-y-4">
      <header className="card card-still flex flex-wrap items-start justify-between gap-4 p-4 sm:p-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-brand">Teamplanung</p>
          <h2 className="mt-1 text-xl font-semibold">Aufgaben</h2>
          <p className="mt-1 text-sm text-muted">Aufgaben annehmen, bearbeiten und mit Ergebnis im Archiv abschließen.</p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="rounded-full bg-amber-500/15 px-3 py-1.5 text-amber-200">{counts.open} bereit</span>
          <span className="rounded-full bg-sky-500/15 px-3 py-1.5 text-sky-200">{counts.active} in Arbeit</span>
          {activeRows.some(([, item]) => item.due && item.due < today) ? (
            <span className="rounded-full bg-red-500/15 px-3 py-1.5 text-red-200">
              {activeRows.filter(([, item]) => item.due && item.due < today).length} Frist(en) überschritten
            </span>
          ) : null}
        </div>
      </header>

      {edit ? (
        <details className="card card-still p-4 sm:p-5">
          <summary className="cursor-pointer font-semibold">Neue Aufgabe erstellen</summary>
          <form className="mt-4 space-y-3" onSubmit={(event) => void createTask(event)}>
            <label className="block text-sm font-medium">
              Titel
              <input className="field mt-1" placeholder="Was soll erledigt werden?" value={title} onChange={(event) => setTitle(event.target.value)} required />
            </label>
            <label className="block text-sm font-medium">
              Details <span className="font-normal text-muted">(optional)</span>
              <textarea className="field mt-1 min-h-20" placeholder="Zusätzliche Informationen" value={text} onChange={(event) => setText(event.target.value)} />
            </label>
            {lead ? (
              <fieldset>
                <legend className="text-sm font-medium">Zuweisung</legend>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button type="button" aria-pressed={scope === "all"} className={scope === "all" ? "btn-brand px-3" : "btn-ghost px-3"} onClick={() => setScope("all")}>Für alle</button>
                  <button type="button" aria-pressed={scope === "one"} className={scope === "one" ? "btn-brand px-3" : "btn-ghost px-3"} onClick={() => setScope("one")}>Für eine Person</button>
                </div>
              </fieldset>
            ) : null}
            {scope === "one" || !lead ? (
              <label className="block text-sm font-medium">
                Für Teammitglied
                <select className="field mt-1" value={assignee} onChange={(event) => setAssignee(event.target.value)}>
                  {members.map((name) => <option key={name} value={name}>{name}</option>)}
                </select>
              </label>
            ) : null}
            <label className="block text-sm font-medium">
              Frist <span className="font-normal text-muted">(optional)</span>
              <input className="field mt-1" type="date" value={due} onChange={(event) => setDue(event.target.value)} />
            </label>
            <button className="btn-brand" type="submit" disabled={saving || !title.trim()}>
              {saving ? "Speichert …" : "Aufgabe erstellen"}
            </button>
          </form>
        </details>
      ) : null}

      <section className="card card-still space-y-4 p-4 sm:p-5" aria-label="Aufgaben filtern">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Aufgabenstatus">
          {([
            ["mine", "Für mich"],
            ["all", "Alle aktiven"],
            ["open", "Bereit"],
            ["active", "In Arbeit"],
          ] as const).map(([value, label]) => (
            <button
              key={value}
              type="button"
              aria-pressed={filter === value}
              className={filter === value ? "btn-brand px-3" : "btn-ghost px-3"}
              onClick={() => setFilter(value)}
            >
              {label} <span className="ml-1 text-xs opacity-70">{counts[value]}</span>
            </button>
          ))}
        </div>
        <label className="block text-sm font-medium">
          Aufgaben durchsuchen
          <input
            className="field mt-1"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Titel, Details oder Teammitglied"
          />
        </label>
        <p className="text-xs text-faint">{visibleRows.length} von {activeRows.length} aktiven Aufgaben · Fristen zuerst</p>
      </section>

      <div className="space-y-3">
        {visibleRows.map(([key, item]) => (
          <TaskCard key={key} id={key} item={item} real={real} username={username} note={note} today={today} />
        ))}
        {!visibleRows.length ? (
          <div className="card card-still p-5 text-center">
            <h3 className="font-semibold">{activeRows.length ? "Keine passenden Aufgaben" : "Keine aktiven Aufgaben"}</h3>
            <p className="mt-1 text-sm text-muted">
              {activeRows.length ? "Ändere die Suche oder den Statusfilter." : "Neue Aufgaben erscheinen hier, sobald sie erstellt werden."}
            </p>
            {activeRows.length && (query || filter !== (lead ? "all" : "mine")) ? (
              <button type="button" className="btn-ghost mt-3" onClick={() => { setQuery(""); setFilter(lead ? "all" : "mine"); }}>
                Filter zurücksetzen
              </button>
            ) : null}
          </div>
        ) : null}
      </div>

      <details className="card card-still p-4 sm:p-5">
        <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-3 font-semibold">
          <span>Aufgabenarchiv</span>
          <span className="rounded-full border border-line px-3 py-1 text-sm text-muted">{archivedRows.length} {archivedRows.length === 1 ? "Aufgabe" : "Aufgaben"}</span>
        </summary>
        <div className="mt-4 space-y-3">
          {visibleArchived.map(([key, item]) => (
            <article key={key} className="rounded-lg border border-line p-4 text-sm">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold">{item.title || "Aufgabe"}</h3>
                  <p className="mt-1 text-muted">{item.text || "Keine Details hinterlegt."}</p>
                </div>
                <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-medium text-emerald-200">Erledigt</span>
              </div>
              <p className="mt-3 text-xs text-faint">
                Erledigt durch {item.acceptedBy || item.by || "Unbekannt"} · gestartet {formatWhen(item.acceptedAt || item.ts)} · abgeschlossen {formatWhen(item.archivedAt || item.updatedAt)}
              </p>
              {item.note ? <p className="mt-3 rounded-md bg-bg p-3"><span className="font-semibold">Ergebnis:</span> {item.note}</p> : null}
              {item.question ? <p className="mt-2 rounded-md bg-bg p-3"><span className="font-semibold">Frage ans Team:</span> {item.question}</p> : null}
              {item.reply ? <p className="mt-2 text-muted"><span className="font-semibold">Antwort:</span> {item.reply}</p> : null}
              {real === "owner" && item.question ? <TaskReply id={key} note={note} /> : null}
            </article>
          ))}
          {!visibleArchived.length ? (
            <p className="rounded-md border border-dashed border-line p-4 text-sm text-muted">
              {archivedRows.length ? "Keine archivierten Aufgaben passen zur Suche." : "Noch keine Aufgaben archiviert."}
            </p>
          ) : null}
        </div>
      </details>
    </section>
  );
}

function TaskCard({ id, item, real, username, note, today }: { id: string; item: TaskItem; real: string; username: string; note: Note; today: string }) {
  const state = taskState(item);
  const mine = taskIsRelevantTo(item, username, real);
  const worker = item.acceptedBy === username || real === "owner";
  const [extra, setExtra] = useState(item.note || "");
  const [question, setQuestion] = useState(item.question || "");
  const [finishing, setFinishing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const overdue = state !== "archived" && Boolean(item.due) && (item.due || "") < today;

  async function acceptTask() {
    if (accepting) return;
    setAccepting(true);
    try {
      await fbUpdate(`tasks/${id}`, { status: "active", acceptedBy: username, acceptedAt: Date.now(), updatedAt: Date.now() });
      note("Aufgabe angenommen");
    } catch (error) {
      note(error instanceof Error ? error.message : "Aufgabe konnte nicht angenommen werden");
    } finally {
      setAccepting(false);
    }
  }

  async function completeTask(event: FormEvent) {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
      await fbUpdate(`tasks/${id}`, {
        status: "archived",
        done: true,
        note: extra.trim(),
        question: question.trim(),
        archivedAt: Date.now(),
        updatedAt: Date.now(),
      });
      note("Aufgabe erledigt und archiviert");
    } catch (error) {
      note(error instanceof Error ? error.message : "Aufgabe konnte nicht archiviert werden");
    } finally {
      setSaving(false);
    }
  }

  return (
    <article className={`card card-still p-4 sm:p-5${overdue ? " border-red-500 bg-red-950/20" : freshStamp(item.ts, item.updatedAt) ? " mark-new" : ""}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
              overdue ? "bg-red-500/15 text-red-200" : state === "active" ? "bg-sky-500/15 text-sky-200" : "bg-amber-500/15 text-amber-200"
            }`}>
              {overdue ? "Frist überschritten" : state === "active" ? "In Arbeit" : "Bereit"}
            </span>
            {item.scope === "all" || !item.assignee ? (
              <span className="rounded-full border border-line px-2.5 py-1 text-xs text-muted">Für alle</span>
            ) : (
              <span className="rounded-full border border-line px-2.5 py-1 text-xs text-muted">Für {item.assignee}</span>
            )}
            {freshStamp(item.ts, item.updatedAt) ? <span className="rounded bg-emerald-500 px-1.5 py-0.5 text-[10px] font-bold uppercase text-black">Neu</span> : null}
          </div>
          <h3 className="mt-3 font-semibold">{item.title || "Aufgabe ohne Titel"}</h3>
          {item.text ? <p className="mt-1 whitespace-pre-wrap text-sm text-muted">{item.text}</p> : null}
        </div>
        {item.due ? (
          <div className={`shrink-0 rounded-lg border px-3 py-2 text-xs ${overdue ? "border-red-500/40 text-red-200" : "border-line text-muted"}`}>
            <span className="block text-faint">Frist</span>
            <time className="mt-0.5 block font-semibold">{formatAbsenceDate(item.due)}</time>
          </div>
        ) : null}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 border-t border-line pt-3 text-xs text-faint">
        <span>Erstellt von {item.by || "Unbekannt"}</span>
        {item.acceptedBy ? <span>Bearbeitet von {item.acceptedBy}</span> : <span>Noch nicht angenommen</span>}
        <span>Erstellt {formatWhen(item.ts)}</span>
      </div>
      {state === "open" && mine ? (
        <button
          type="button"
          className="btn-brand mt-3"
          disabled={accepting}
          onClick={() => void acceptTask()}
        >
          {accepting ? "Wird angenommen …" : "Aufgabe annehmen"}
        </button>
      ) : null}
      {state === "active" && worker ? (
        finishing ? (
          <form className="mt-4 space-y-3 rounded-lg border border-line p-4" onSubmit={(event) => void completeTask(event)}>
            <h4 className="font-semibold">Aufgabe abschließen</h4>
            <label className="block text-sm font-medium">
              Ergebnisnotiz <span className="font-normal text-muted">(optional)</span>
              <textarea className="field mt-1 min-h-20" placeholder="Was wurde erledigt?" value={extra} onChange={(event) => setExtra(event.target.value)} />
            </label>
            <label className="block text-sm font-medium">
              Frage ans Team <span className="font-normal text-muted">(optional)</span>
              <textarea className="field mt-1 min-h-20" placeholder="Gibt es noch etwas zu klären?" value={question} onChange={(event) => setQuestion(event.target.value)} />
            </label>
            <div className="flex flex-wrap gap-2">
              <button type="submit" className="btn-brand" disabled={saving}>{saving ? "Wird archiviert …" : "Erledigt und archivieren"}</button>
              <button type="button" className="btn-ghost" disabled={saving} onClick={() => setFinishing(false)}>Abbrechen</button>
            </div>
          </form>
        ) : (
          <button type="button" className="btn-brand mt-3" onClick={() => setFinishing(true)}>Ergebnis eintragen und abschließen</button>
        )
      ) : null}
      {real === "owner" ? (
        <button
          type="button"
          className="btn-ghost mt-3 px-3"
          onClick={() => {
            if (!window.confirm("Diese Aufgabe endgültig löschen?")) return;
            void fbRemove(`tasks/${id}`).then(() => note("Aufgabe gelöscht")).catch((error) => note(error instanceof Error ? error.message : "Löschen fehlgeschlagen"));
          }}
        >
          Aufgabe löschen
        </button>
      ) : null}
    </article>
  );
}

function TaskReply({ id, note }: { id: string; note: Note }) {
  const [reply, setReply] = useState("");
  const [saving, setSaving] = useState(false);

  async function send(event: FormEvent) {
    event.preventDefault();
    if (!reply.trim() || saving) return;
    setSaving(true);
    try {
      await fbUpdate(`tasks/${id}`, { reply: reply.trim(), updatedAt: Date.now() });
      setReply("");
      note("Antwort gespeichert");
    } catch (error) {
      note(error instanceof Error ? error.message : "Antwort konnte nicht gespeichert werden");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="mt-3 space-y-2" onSubmit={(event) => void send(event)}>
      <label className="block text-sm font-medium">
        Antwort auf die Frage
        <textarea className="field mt-1 min-h-20" placeholder="Nachricht ans Teammitglied" value={reply} onChange={(event) => setReply(event.target.value)} required />
      </label>
      <button className="btn-ghost" type="submit" disabled={saving || !reply.trim()}>{saving ? "Speichert …" : "Antwort senden"}</button>
    </form>
  );
}

export function AbsenceBoard({ real, view, note, username }: { real: string; view: string; note: Note; username: string }) {
  const rows = useLive<{ by?: string; from?: string; until?: string; reason?: string; ts?: number; updatedAt?: number }>("absences");
  const people = useLive<{ role?: string }>(
    "staffDirectory",
    true,
    real === "builder" || real === "buildmanager" ? BUILDER_DIRECTORY_QUERY : undefined,
  );
  const edit = can(view, "absence");
  const owner = real === "owner";
  const today = localDateKey();
  const teamMembers = [...new Set([...entries(people).map(([name]) => name), username])]
    .sort((first, second) => first.localeCompare(second, "de"));
  const [who, setWho] = useState(username);
  const [from, setFrom] = useState("");
  const [until, setUntil] = useState("");
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const absenceRows = entries(rows).sort(([, first], [, second]) => {
    const firstPast = Boolean(first.until && first.until < today);
    const secondPast = Boolean(second.until && second.until < today);
    if (firstPast !== secondPast) return firstPast ? 1 : -1;
    return firstPast
      ? (second.from || "").localeCompare(first.from || "")
      : (first.from || "").localeCompare(second.from || "");
  });

  async function saveAbsence(event: FormEvent) {
    event.preventDefault();
    if (!guard(real, "absence", note)) return;
    if (!from || !until || from > until) {
      setError("Bitte einen gültigen Zeitraum mit Ende am oder nach dem Start wählen.");
      return;
    }
    setError("");
    setSaving(true);
    try {
      const person = owner ? who || username : username;
      await fbPush("absences", { by: person, from, until, reason: reason.trim(), ts: Date.now() });
      setReason("");
      setFrom("");
      setUntil("");
      note("Abwesenheit gespeichert");
    } catch (failure) {
      const detail = failure instanceof Error ? failure.message : "Unbekannter Fehler";
      setError(`Fehlercode ABS-001: Abwesenheit konnte nicht gespeichert werden. ${detail}`);
    } finally {
      setSaving(false);
    }
  }

  async function removeAbsence(key: string) {
    if (!guard(real, "absence", note)) return;
    try {
      await fbRemove(`absences/${key}`);
      note("Abwesenheit entfernt");
    } catch (failure) {
      const detail = failure instanceof Error ? failure.message : "Unbekannter Fehler";
      note(`Fehlercode ABS-002: Abwesenheit konnte nicht entfernt werden. ${detail}`);
    }
  }

  return (
    <section className="space-y-4">
      {edit ? (
        <form className="card card-still space-y-4 p-5" onSubmit={(event) => void saveAbsence(event)}>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-brand">Teamplanung</p>
            <h2 className="mt-1 text-lg font-semibold">{owner ? "Abwesenheit eintragen" : "Eigene Abwesenheit"}</h2>
            <p className="mt-1 text-sm text-muted">Wähle den Zeitraum. Der Eintrag erscheint danach im Kalender.</p>
          </div>
          {owner ? (
            <label className="block text-sm font-medium">
              Für Teammitglied
              <select className="field mt-1" value={who} onChange={(e) => setWho(e.target.value)}>
                {teamMembers.map((name) => <option key={name} value={name}>{name}</option>)}
              </select>
            </label>
          ) : null}
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm font-medium">
              Von
              <input className="field mt-1" type="date" required value={from} onChange={(e) => setFrom(e.target.value)} />
            </label>
            <label className="block text-sm font-medium">
              Bis
              <input className="field mt-1" type="date" required value={until} onChange={(e) => setUntil(e.target.value)} />
            </label>
          </div>
          <label className="block text-sm font-medium">
            Hinweis <span className="font-normal text-muted">(optional)</span>
            <input className="field mt-1" placeholder="Zum Beispiel: Ferien oder Schule" value={reason} onChange={(e) => setReason(e.target.value)} />
          </label>
          {error ? <p className="text-sm text-ember" role="alert">{error}</p> : null}
          <button className="btn-brand w-full sm:w-auto" type="submit" disabled={saving}>{saving ? "Speichere…" : "Abwesenheit speichern"}</button>
        </form>
      ) : null}
      <AbsenceCalendar rows={absenceRows.map(([, item]) => item)} today={today} />
      <section className="card card-still space-y-3 p-4 sm:p-5" aria-labelledby="absence-list-heading">
        <div>
          <h2 id="absence-list-heading" className="text-lg font-semibold">Eingetragene Abwesenheiten</h2>
          <p className="mt-1 text-sm text-muted">Aktuelle und geplante zuerst; vergangene Einträge bleiben zum Nachschauen erhalten.</p>
        </div>
        {absenceRows.length === 0 ? (
          <p className="rounded-md border border-line p-4 text-sm text-muted">Noch keine Abwesenheiten eingetragen.</p>
        ) : (
          <div className="space-y-2">
            {absenceRows.map(([key, item]) => {
              const status = !item.from || !item.until
                ? "Zeitraum prüfen"
                : item.from > today
                  ? "Geplant"
                  : item.until < today
                    ? "Vergangen"
                    : "Aktuell";
              const isNew = freshStamp(item.ts, item.updatedAt);
              return (
                <article key={key} className={`rounded-lg border border-line p-4${isNew ? " mark-new" : ""}`}>
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold">
                        {item.by || "Unbekannt"}
                        {isNew ? <span className="ml-2 rounded bg-emerald-500 px-1.5 py-0.5 text-[10px] font-bold uppercase text-black">Neu</span> : null}
                      </p>
                      <p className="mt-1 text-sm text-muted">
                        {formatAbsenceDate(item.from)} – {formatAbsenceDate(item.until)}
                      </p>
                      <p className="mt-1 text-sm">{item.reason?.trim() || "Kein Hinweis angegeben"}</p>
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      status === "Aktuell"
                        ? "bg-emerald-500/15 text-emerald-200"
                        : status === "Geplant"
                          ? "bg-brand/15 text-brand"
                          : "bg-line text-muted"
                    }`}>
                      {status}
                    </span>
                  </div>
                  {(owner || item.by === username) && edit ? (
                    <button type="button" className="btn-ghost mt-3 px-3" onClick={() => void removeAbsence(key)}>
                      {owner ? "Abwesenheit löschen" : "Meine Abwesenheit entfernen"}
                    </button>
                  ) : null}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </section>
  );
}

type AbsenceCalendarRow = { by?: string; from?: string; until?: string; reason?: string };

function localDateKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function formatAbsenceDate(value?: string) {
  if (!value) return "Datum fehlt";
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString("de-CH", { day: "numeric", month: "short", year: "numeric" });
}

function AbsenceCalendar({ rows, today }: { rows: AbsenceCalendarRow[]; today: string }) {
  const [cursor, setCursor] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(() => localDateKey());
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const pad = (new Date(year, month, 1).getDay() + 6) % 7;
  const count = new Date(year, month + 1, 0).getDate();
  const cells: Array<number | null> = [...Array(pad).fill(null), ...Array.from({ length: count }, (_, index) => index + 1)];
  const label = cursor.toLocaleString("de-CH", { month: "long", year: "numeric" });
  const selectedRows = selectedDate
    ? rows.filter((item) => item.from && item.until && item.from <= selectedDate && selectedDate <= item.until)
    : [];
  const todayCursor = localDateKey(cursor) === today;

  function moveMonth(offset: number) {
    setCursor(new Date(year, month + offset, 1));
    setSelectedDate(null);
  }

  function showCurrentMonth() {
    const currentDate = new Date();
    setCursor(currentDate);
    setSelectedDate(localDateKey(currentDate));
  }

  return (
    <section className="card card-still space-y-4 p-4 sm:p-5" aria-labelledby="absence-calendar-heading">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-brand">Übersicht</p>
          <h2 id="absence-calendar-heading" className="mt-1 text-lg font-semibold">Abwesenheitskalender</h2>
        </div>
        <div className="flex items-center gap-1">
          <button type="button" className="btn-ghost px-3" aria-label="Vorheriger Monat" onClick={() => moveMonth(-1)}>←</button>
          <div className="min-w-32 text-center">
            <p className="font-semibold capitalize">{label}</p>
            {!todayCursor ? (
              <button type="button" className="text-xs text-brand underline underline-offset-2" onClick={showCurrentMonth}>
                Zum aktuellen Monat
              </button>
            ) : null}
          </div>
          <button type="button" className="btn-ghost px-3" aria-label="Nächster Monat" onClick={() => moveMonth(1)}>→</button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1.5 text-center text-xs">
        {["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"].map((day) => (
          <p key={day} className="py-1 font-semibold text-faint">{day}</p>
        ))}
        {cells.map((day, index) => {
          if (!day) return <div key={`empty-${index}`} aria-hidden="true" />;
          const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const names = [...new Set(rows
            .filter((item) => item.from && item.until && item.from <= key && key <= item.until)
            .map((item) => item.by || "Unbekannt"))];
          const isSelected = selectedDate === key;
          const isToday = today === key;
          return (
            <button
              key={key}
              type="button"
              aria-pressed={isSelected}
              aria-label={`${formatAbsenceDate(key)}: ${names.length ? `${names.length} abwesend: ${names.join(", ")}` : "keine Abwesenheiten"}`}
              title={names.length ? names.join(", ") : "Keine Abwesenheiten"}
              onClick={() => setSelectedDate(key)}
              className={`flex min-h-16 flex-col items-center justify-start rounded-lg border p-1.5 text-center transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand sm:min-h-20 ${
                isSelected
                  ? "border-brand bg-brand/15 ring-1 ring-brand/40"
                  : names.length
                    ? "border-brand/50 bg-brand/5 hover:bg-brand/10"
                    : "border-line hover:bg-panel"
              }`}
            >
              <span className={`grid h-6 w-6 place-items-center rounded-full font-semibold ${isToday ? "bg-brand text-white" : ""}`}>{day}</span>
              <span className={`mt-1 text-[9px] leading-tight sm:text-[10px] ${names.length ? "font-semibold text-brand" : "text-transparent"}`}>
                {names.length ? `${names.length} abw.` : "—"}
              </span>
            </button>
          );
        })}
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
        <span><span className="mr-1.5 inline-block h-2.5 w-2.5 rounded-sm border border-brand/50 bg-brand/10 align-middle" />Abwesenheit eingetragen</span>
        <span><span className="mr-1.5 inline-block h-2.5 w-2.5 rounded-full bg-brand align-middle" />Heute</span>
        <span>Tag auswählen, um Details zu sehen</span>
      </div>
      <div className="rounded-lg border border-line bg-panel p-4" aria-live="polite">
        <h3 className="font-semibold">
          {selectedDate ? `Abwesenheiten am ${formatAbsenceDate(selectedDate)}` : "Tagesdetails"}
        </h3>
        {!selectedDate ? (
          <p className="mt-1 text-sm text-muted">Wähle einen Tag im Kalender aus.</p>
        ) : selectedRows.length ? (
          <ul className="mt-2 space-y-2">
            {selectedRows.map((item, index) => (
              <li key={`${item.by || "staff"}-${item.from}-${index}`} className="rounded-md border border-line p-3 text-sm">
                <p className="font-medium">{item.by || "Unbekannt"}</p>
                <p className="mt-0.5 text-muted">{item.reason?.trim() || "Kein Hinweis angegeben"}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-1 text-sm text-muted">An diesem Tag ist niemand als abwesend eingetragen.</p>
        )}
      </div>
    </section>
  );
}

export function GuideEditor({ real, view, note }: { real: string; view: string; note: Note }) {
  const rows = useLive<{ title?: string; description?: string; category?: string; steps?: string; image?: string }>("guideTopics");
  const edit = can(view, "guide");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("AlpenSMP");
  const [steps, setSteps] = useState("");
  const [image, setImage] = useState("");

  return (
    <section className="space-y-3">
      {edit ? (
        <form
          className="card card-still p-5"
          onSubmit={(event) => {
            event.preventDefault();
            if (!guard(real, "guide", note) || !title.trim()) return;
            void fbPush("guideTopics", {
              title: title.trim(),
              description: description.trim(),
              category: category.trim(),
              steps: steps.trim(),
              image: image.trim(),
              ts: Date.now(),
              active: true,
            }).then(() => {
              setTitle("");
              setDescription("");
              setSteps("");
              setImage("");
              note("Guide-Thema gespeichert");
            });
          }}
        >
          <h2 className="text-lg font-semibold">Guide-Thema</h2>
          <input className="field mt-3" placeholder="Titel" value={title} onChange={(e) => setTitle(e.target.value)} />
          <input className="field mt-2" placeholder="Kategorie" value={category} onChange={(e) => setCategory(e.target.value)} />
          <input className="field mt-2" placeholder="Kurzbeschreibung" value={description} onChange={(e) => setDescription(e.target.value)} />
          <textarea className="field mt-2 min-h-24" placeholder="Schritte, eine Zeile pro Schritt" value={steps} onChange={(e) => setSteps(e.target.value)} />
          <input className="field mt-2" placeholder="Bild-URL, optional" value={image} onChange={(e) => setImage(e.target.value)} />
          <button className="btn-brand mt-3" type="submit">Speichern</button>
        </form>
      ) : null}
      {entries(rows).map(([key, item]) => (
        <article key={key} className="card card-still p-4 text-sm">
          <p className="text-xs text-faint">{item.category}</p>
          <p className="font-semibold">{item.title}</p>
          <p className="text-muted">{item.description}</p>
          {item.image ? <img src={item.image} alt={item.title || "Bild zum Guide"} className="mt-2 max-h-36 rounded-md object-cover" loading="lazy" decoding="async" /> : null}
          {edit ? (
            <button type="button" className="btn-ghost mt-2 px-3" onClick={() => guard(real, "guide", note) && void fbRemove(`guideTopics/${key}`).then(() => note("Thema entfernt"))}>
              Löschen
            </button>
          ) : null}
        </article>
      ))}
    </section>
  );
}

export function LockdownTexts({ real, view, note }: { real: string; view: string; note: Note }) {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const show = can(view, "lockdown");
  if (!show) return null;

  return (
    <form
      className="card card-still mt-4 p-5"
      onSubmit={(event) => {
        event.preventDefault();
        if (!guard(real, "lockdown", note)) return;
        void fbUpdate("site_copy", { lockdown: { title, message, updated_at: Date.now(), updated_by: real } }).then(() => note("Lockdown-Text gespeichert"));
      }}
    >
      <h2 className="text-lg font-semibold">Lockdown-Text</h2>
      <p className="mt-1 text-sm text-muted">Nur Owner. Setzt niemanden zurück und löscht nichts.</p>
      <input className="field mt-3" placeholder="Titel" value={title} onChange={(e) => setTitle(e.target.value)} />
      <textarea className="field mt-2 min-h-20" placeholder="Text" value={message} onChange={(e) => setMessage(e.target.value)} />
      <button className="btn-brand mt-3" type="submit">Text speichern</button>
    </form>
  );
}

const MODES: { id: MascotMode; label: string }[] = [
  { id: "auto", label: "Automatisch" },
  { id: "stand", label: "Immer stehen" },
  { id: "idle", label: "Idle" },
  { id: "sit", label: "Immer sitzen" },
  { id: "sleep", label: "Schlafen" },
  { id: "wave", label: "Winken" },
  { id: "custom", label: "Benutzerdefiniert" },
];

const TESTS: { id: Act; label: string }[] = [
  { id: "stand", label: "Stehen" },
  { id: "sit", label: "Sitzen" },
  { id: "sleep", label: "Schlafen" },
  { id: "wake", label: "Aufwachen" },
  { id: "wave", label: "Winken" },
  { id: "yawn", label: "Gähnen" },
  { id: "stretch", label: "Strecken" },
  { id: "pet", label: "Streicheln" },
  { id: "surprise", label: "Überraschung" },
  { id: "look", label: "Anschauen" },
];

export function MascotDesk({ real, note }: { real: string; note: Note }) {
  const [form, setForm] = useState<MascotSettings>(MASCOT_DEFAULT);
  const [order, setOrder] = useState("");
  const [demo, setDemo] = useState<Act>("stand");

  useEffect(() => {
    fbGet<MascotSettings>("mascotSettings")
      .then((value) => {
        if (!value) return;
        const next = { ...MASCOT_DEFAULT, ...value };
        setForm(next);
        setOrder(next.order || "");
      })
      .catch(() => {});
  }, []);

  function save(next: MascotSettings) {
    if (!can(real, "mascot")) {
      note("Deine echte Rolle darf das nicht");
      return;
    }
    void fbSet("mascotSettings", next).then(() => {
      setForm(next);
      note("Maskottchen gespeichert");
    });
  }

  return (
    <div className="card card-still max-w-3xl space-y-4 p-5">
      <h2 className="text-lg font-semibold">Maskottchen</h2>
      <p className="text-sm text-muted">3D-Figur, fester Platz. In der Vorschau kannst du sie drehen.</p>
      <div className="mascot-preview">
        <MascotView act={demo} gaze={{ x: 0, y: 0 }} preview />
      </div>
      <div className="flex flex-wrap gap-2">
        {TESTS.map((item) => (
          <button key={item.id} type="button" className={demo === item.id ? "btn-brand" : "btn-ghost"} onClick={() => setDemo(item.id)}>
            {item.label}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {MODES.map((mode) => (
          <button key={mode.id} type="button" className={form.mode === mode.id ? "btn-brand" : "btn-ghost"} onClick={() => save({ ...form, mode: mode.id, order: mode.id === "auto" ? "" : form.order })}>
            {mode.label}
          </button>
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Num label="Aktivität 1–5" value={form.pace} min={1} max={5} onChange={(pace) => setForm({ ...form, pace })} />
        <Num label="Idle-Zeit in Sekunden" value={form.idle} min={4} max={40} onChange={(idle) => setForm({ ...form, idle })} />
        <Num label="Schlaf-Wahrscheinlichkeit" value={form.sleep} min={0} max={100} onChange={(sleep) => setForm({ ...form, sleep })} />
        <Num label="Sitz-Wahrscheinlichkeit" value={form.sit} min={0} max={100} onChange={(sit) => setForm({ ...form, sit })} />
        <Num label="Besondere Aktionen" value={form.special} min={0} max={100} onChange={(special) => setForm({ ...form, special })} />
        <Num label="Reaktionsstärke 1–3" value={form.reaction} min={1} max={3} onChange={(reaction) => setForm({ ...form, reaction })} />
      </div>
      <button type="button" className="btn-brand" onClick={() => save(form)}>Werte speichern</button>
      <form
        className="space-y-2 border-t border-line pt-4"
        onSubmit={(event) => {
          event.preventDefault();
          save({ ...form, mode: "custom", order: order.trim() });
        }}
      >
        <label className="block text-sm">
          Maskottchen-Anweisung
          <input className="field mt-1" value={order} placeholder="Setz dich hin. Schlaf jetzt. Wink den Besuchern." onChange={(event) => setOrder(event.target.value)} />
        </label>
        <div className="flex flex-wrap gap-2">
          <button className="btn-brand" type="submit">Ausführen</button>
          <button className="btn-ghost" type="button" onClick={() => { setOrder(""); save({ ...form, order: "", mode: "auto" }); }}>
            Anweisung löschen
          </button>
        </div>
      </form>
    </div>
  );
}

function Num({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (value: number) => void }) {
  return (
    <label className="block text-sm">
      {label}
      <input className="field mt-1" type="number" min={min} max={max} value={value} onChange={(event) => onChange(Number(event.target.value))} />
    </label>
  );
}
