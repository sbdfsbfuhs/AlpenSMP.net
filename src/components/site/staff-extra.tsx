import { useEffect, useState, type FormEvent } from "react";
import { BEDROCK_COMMANDS, COMMANDS } from "@/lib/alpen/content";
import { MASCOT_DEFAULT, type Act, type MascotMode, type MascotSettings } from "@/lib/alpen/mascot";
import { can, type Area } from "@/lib/alpen/roles";
import { MascotView } from "@/components/site/mascot-art";
import { entries, fbGet, fbPush, fbRemove, fbSet, fbUpdate, formatWhen, freshStamp } from "@/lib/alpen/staff";

type Note = (text: string) => void;

function useLive<T>(path: string) {
  const [data, setData] = useState<Record<string, T>>({});
  useEffect(() => {
    let stop = false;
    const pull = () => {
      fbGet<Record<string, T>>(path)
        .then((value) => {
          if (!stop) setData(value ?? {});
        })
        .catch(() => {});
    };
    pull();
    const id = window.setInterval(pull, 6000);
    return () => {
      stop = true;
      window.clearInterval(id);
    };
  }, [path]);
  return data;
}

function guard(real: string, area: Area, note: Note) {
  if (can(real, area)) return true;
  note("Deine echte Rolle darf das nicht");
  return false;
}

export function PlayerCommandEditor({ real, view, note }: { real: string; view: string; note: Note }) {
  const java = useLive<{ cmd?: string; text?: string }>("playerCommands/java");
  const bedrock = useLive<{ cmd?: string; text?: string }>("playerCommands/bedrock");
  const edit = can(view, "commandsEdit");

  return (
    <div className="space-y-6">
      <CommandList title="Java" path="playerCommands/java" rows={entries(java)} real={real} edit={edit} note={note} seed={COMMANDS} />
      <CommandList title="Bedrock" path="playerCommands/bedrock" rows={entries(bedrock)} real={real} edit={edit} note={note} seed={BEDROCK_COMMANDS} />
    </div>
  );
}

function CommandList({
  title,
  path,
  rows,
  real,
  edit,
  note,
  seed,
}: {
  title: string;
  path: string;
  rows: [string, { cmd?: string; text?: string }][];
  real: string;
  edit: boolean;
  note: Note;
  seed: { cmd: string; text: string }[];
}) {
  const [cmd, setCmd] = useState("");
  const [text, setText] = useState("");

  async function add(event: FormEvent) {
    event.preventDefault();
    if (!guard(real, "commandsEdit", note)) return;
    if (!cmd.trim()) return note("Befehl fehlt");
    await fbPush(path, { cmd: cmd.trim(), text: text.trim(), ts: Date.now() });
    setCmd("");
    setText("");
    note("Gespeichert");
  }

  return (
    <section className="card card-still p-5">
      <h2 className="text-lg font-semibold">Spieler-Befehle · {title}</h2>
      <p className="mt-1 text-sm text-muted">Leer lassen heisst: die Website zeigt die feste Liste. Sobald hier etwas steht, gilt das live.</p>
      {edit ? (
        <form className="mt-3 grid gap-2" onSubmit={add}>
          <input className="field" placeholder="/befehl" value={cmd} onChange={(e) => setCmd(e.target.value)} />
          <input className="field" placeholder="Beschreibung" value={text} onChange={(e) => setText(e.target.value)} />
          <div className="flex flex-wrap gap-2">
            <button className="btn-gold" type="submit">Hinzufügen</button>
            {!rows.length ? (
              <button
                className="btn-ghost"
                type="button"
                onClick={() => {
                  if (!guard(real, "commandsEdit", note)) return;
                  void Promise.all(seed.map((item) => fbPush(path, { ...item, ts: Date.now() }))).then(() => note("Liste übernommen"));
                }}
              >
                Aktuelle Website übernehmen
              </button>
            ) : null}
          </div>
        </form>
      ) : null}
      <ul className="mt-4 space-y-2">
        {rows.map(([key, item]) => (
          <li key={key} className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-line px-3 py-2 text-sm">
            <span><code className="text-gold">{item.cmd}</code> <span className="text-muted">{item.text}</span></span>
            {edit ? (
              <button
                type="button"
                className="btn-ghost px-3"
                onClick={() => {
                  if (!guard(real, "commandsEdit", note)) return;
                  void fbRemove(`${path}/${key}`).then(() => note("Entfernt"));
                }}
              >
                Löschen
              </button>
            ) : null}
          </li>
        ))}
        {!rows.length ? <li className="text-sm text-muted">Noch nichts in Firebase. Die öffentliche Seite nutzt die feste Liste.</li> : null}
      </ul>
    </section>
  );
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
          <button className="btn-gold" type="submit">Abschnitt speichern</button>
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
          <button className="btn-gold" type="submit">Eintragen</button>
        </form>
      ) : null}
      <ul className="mt-4 space-y-2 text-sm">
        {entries(rows).map(([key, item]) => (
          <li key={key} className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-line px-3 py-2">
            <span>{item.offense} · {item.duration} · <code className="text-gold">{item.command}</code></span>
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

function taskState(item: TaskItem) {
  if (item.status === "archived" || item.done) return "archived";
  if (item.status === "active") return "active";
  return "open";
}

export function TasksBoard({ real, view, note, username }: { real: string; view: string; note: Note; username: string }) {
  const rows = useLive<TaskItem>("tasks");
  const people = useLive<{ role?: string }>("staffUsers");
  const edit = can(view, "tasks");
  const lead = real === "owner" || real === "admin";
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [scope, setScope] = useState(lead ? "all" : "one");
  const [assignee, setAssignee] = useState(username);
  const [due, setDue] = useState("");
  const open = entries(rows).filter(([, item]) => taskState(item) !== "archived");
  const archived = entries(rows).filter(([, item]) => taskState(item) === "archived");

  return (
    <section className="space-y-3">
      {edit ? (
        <form
          className="card card-still p-5"
          onSubmit={(event) => {
            event.preventDefault();
            if (!guard(real, "tasks", note) || !title.trim()) return;
            const forAll = lead && scope === "all";
            void fbPush("tasks", {
              title: title.trim(),
              text: text.trim(),
              by: username,
              scope: forAll ? "all" : "one",
              assignee: forAll ? "" : assignee || username,
              due,
              status: "open",
              done: false,
              ts: Date.now(),
            }).then(() => {
              setTitle("");
              setText("");
              setDue("");
              note("Aufgabe liegt bereit");
            });
          }}
        >
          <h2 className="text-lg font-semibold">Aufgabe</h2>
          <p className="mt-1 text-sm text-muted">Jemand nimmt sie an, bearbeitet sie und archiviert sie. Im Archiv steht, wer sie erledigt hat, von wann bis wann, plus Notiz oder Frage.</p>
          <input className="field mt-3" placeholder="Titel" value={title} onChange={(e) => setTitle(e.target.value)} />
          <textarea className="field mt-2 min-h-20" placeholder="Details" value={text} onChange={(e) => setText(e.target.value)} />
          {lead ? (
            <div className="mt-2 flex flex-wrap gap-2">
              <button type="button" className={scope === "all" ? "btn-gold px-3" : "btn-ghost px-3"} onClick={() => setScope("all")}>Für alle</button>
              <button type="button" className={scope === "one" ? "btn-gold px-3" : "btn-ghost px-3"} onClick={() => setScope("one")}>Für eine Person</button>
            </div>
          ) : null}
          {scope === "one" || !lead ? (
            <select className="field mt-2" value={assignee} onChange={(e) => setAssignee(e.target.value)}>
              <option value={username}>{username}</option>
              {entries(people).map(([name]) => name === username ? null : <option key={name} value={name}>{name}</option>)}
            </select>
          ) : null}
          <label className="mt-2 block text-sm">Frist, optional<input className="field mt-1" type="date" value={due} onChange={(e) => setDue(e.target.value)} /></label>
          <button className="btn-gold mt-3" type="submit">Speichern</button>
        </form>
      ) : null}
      {open.map(([key, item]) => (
        <TaskCard key={key} id={key} item={item} real={real} username={username} note={note} />
      ))}
      <h2 className="pt-2 text-lg font-semibold">Archiviert</h2>
      {archived.map(([key, item]) => (
        <article key={key} className="card card-still p-4 text-sm">
          <p className="font-semibold">{item.title}</p>
          <p className="mt-1 text-muted">{item.text}</p>
          <p className="mt-2 text-xs text-faint">
            Erledigt durch {item.acceptedBy || item.by || "–"} · von {formatWhen(item.acceptedAt || item.ts)} bis {formatWhen(item.archivedAt || item.updatedAt)}
          </p>
          {item.note ? <p className="mt-2">Notiz: {item.note}</p> : null}
          {item.question ? <p className="mt-1">Frage: {item.question}</p> : null}
          {item.reply ? <p className="mt-1 text-muted">Antwort: {item.reply}</p> : null}
          {real === "owner" ? <TaskReply id={key} note={note} /> : null}
        </article>
      ))}
      {!archived.length ? <p className="text-sm text-muted">Noch nichts archiviert</p> : null}
    </section>
  );
}

function TaskCard({ id, item, real, username, note }: { id: string; item: TaskItem; real: string; username: string; note: Note }) {
  const state = taskState(item);
  const mine = !item.assignee || item.assignee === username || item.scope === "all" || real === "owner";
  const worker = item.acceptedBy === username || real === "owner";
  const [extra, setExtra] = useState(item.note || "");
  const [question, setQuestion] = useState(item.question || "");

  const today = new Date().toISOString().slice(0, 10);
  const overdue = state === "open" && Boolean(item.due) && (item.due || "") < today;

  return (
    <article className={`card card-still p-4 text-sm${overdue ? " border-red-500 bg-red-950/40" : freshStamp(item.ts, item.updatedAt) ? " mark-new" : ""}`}>
      <p className={`font-semibold${overdue ? " text-red-200" : ""}`}>
        {overdue ? "Frist vorbei · " : state === "active" ? "In Arbeit · " : "Offen · "}
        {item.title}
        {freshStamp(item.ts, item.updatedAt) ? <span className="ml-2 rounded bg-emerald-500 px-1.5 py-0.5 text-[10px] font-bold uppercase text-black">Neu</span> : null}
      </p>
      <p className="mt-1 text-muted">{item.text}</p>
      <p className="mt-1 text-xs text-faint">
        {item.scope === "all" || !item.assignee ? "Für alle" : `Für ${item.assignee}`} · von {item.by}
        {item.due ? ` · Frist ${item.due}` : ""}
        {item.acceptedBy ? ` · angenommen von ${item.acceptedBy}` : ""}
      </p>
      {state === "open" && mine ? (
        <button
          type="button"
          className="btn-gold mt-3"
          onClick={() => void fbUpdate(`tasks/${id}`, { status: "active", acceptedBy: username, acceptedAt: Date.now(), updatedAt: Date.now() }).then(() => note("Angenommen"))}
        >
          Annehmen
        </button>
      ) : null}
      {state === "active" && worker ? (
        <div className="mt-3 space-y-2">
          <textarea className="field min-h-16" placeholder="Notiz zum Ergebnis" value={extra} onChange={(e) => setExtra(e.target.value)} />
          <textarea className="field min-h-16" placeholder="Frage ans Team, optional" value={question} onChange={(e) => setQuestion(e.target.value)} />
          <button
            type="button"
            className="btn-gold"
            onClick={() => void fbUpdate(`tasks/${id}`, {
              status: "archived",
              done: true,
              note: extra.trim(),
              question: question.trim(),
              archivedAt: Date.now(),
              updatedAt: Date.now(),
            }).then(() => note("Archiviert"))}
          >
            Erledigt und archivieren
          </button>
        </div>
      ) : null}
      {real === "owner" ? (
        <button type="button" className="btn-ghost mt-2 px-3" onClick={() => void fbRemove(`tasks/${id}`).then(() => note("Gelöscht"))}>Löschen</button>
      ) : null}
    </article>
  );
}

function TaskReply({ id, note }: { id: string; note: Note }) {
  const [reply, setReply] = useState("");
  return (
    <form
      className="mt-2 flex gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        if (!reply.trim()) return;
        void fbUpdate(`tasks/${id}`, { reply: reply.trim(), updatedAt: Date.now() }).then(() => {
          setReply("");
          note("Antwort gespeichert");
        });
      }}
    >
      <input className="field" placeholder="Antwort auf die Frage" value={reply} onChange={(e) => setReply(e.target.value)} />
      <button className="btn-ghost" type="submit">Antworten</button>
    </form>
  );
}

export function AbsenceBoard({ real, view, note, username }: { real: string; view: string; note: Note; username: string }) {
  const rows = useLive<{ by?: string; from?: string; until?: string; reason?: string; ts?: number; updatedAt?: number }>("absences");
  const people = useLive<{ role?: string }>("staffUsers");
  const edit = can(view, "absence");
  const owner = real === "owner";
  const [who, setWho] = useState(username);
  const [from, setFrom] = useState("");
  const [until, setUntil] = useState("");
  const [reason, setReason] = useState("");

  return (
    <section className="space-y-3">
      {edit ? (
        <form
          className="card card-still p-5"
          onSubmit={(event) => {
            event.preventDefault();
            if (!guard(real, "absence", note)) return;
            const person = owner ? who || username : username;
            void fbPush("absences", { by: person, from, until, reason: reason.trim(), ts: Date.now() }).then(() => {
              setReason("");
              note("Abwesenheit gespeichert");
            });
          }}
        >
          <h2 className="text-lg font-semibold">{owner ? "Abwesenheit eintragen" : "Eigene Abwesenheit"}</h2>
          {owner ? (
            <select className="field mt-3" value={who} onChange={(e) => setWho(e.target.value)}>
              <option value={username}>{username}</option>
              {entries(people).map(([name]) => name === username ? null : <option key={name} value={name}>{name}</option>)}
            </select>
          ) : null}
          <label className="mt-3 block text-sm">Von<input className="field mt-1" type="date" value={from} onChange={(e) => setFrom(e.target.value)} /></label>
          <label className="mt-2 block text-sm">Bis<input className="field mt-1" type="date" value={until} onChange={(e) => setUntil(e.target.value)} /></label>
          <input className="field mt-2" placeholder="Grund" value={reason} onChange={(e) => setReason(e.target.value)} />
          <button className="btn-gold mt-3" type="submit">Speichern</button>
        </form>
      ) : null}
      <AbsenceCalendar rows={entries(rows)} />
      {entries(rows).map(([key, item]) => (
        <article key={key} className={`card card-still p-4 text-sm${freshStamp(item.ts, item.updatedAt) ? " mark-new" : ""}`}>
          <p className="font-semibold">{item.by}{freshStamp(item.ts, item.updatedAt) ? <span className="ml-2 rounded bg-emerald-500 px-1.5 py-0.5 text-[10px] font-bold uppercase text-black">Neu</span> : null}</p>
          <p className="text-muted">{item.from} bis {item.until}</p>
          <p className="text-muted">{item.reason}</p>
          {(owner || item.by === username) && edit ? (
            <button type="button" className="btn-ghost mt-2 px-3" onClick={() => guard(real, "absence", note) && void fbRemove(`absences/${key}`).then(() => note("Entfernt"))}>
              {owner ? "Löschen" : "Meine entfernen"}
            </button>
          ) : null}
        </article>
      ))}
    </section>
  );
}

function AbsenceCalendar({ rows }: { rows: [string, { by?: string; from?: string; until?: string }][] }) {
  const [cursor, setCursor] = useState(() => new Date());
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const pad = (new Date(year, month, 1).getDay() + 6) % 7;
  const count = new Date(year, month + 1, 0).getDate();
  const cells: Array<number | null> = [...Array(pad).fill(null), ...Array.from({ length: count }, (_, index) => index + 1)];
  const label = cursor.toLocaleString("de-CH", { month: "long", year: "numeric" });

  return (
    <section className="card card-still p-4">
      <div className="flex items-center justify-between gap-2">
        <button type="button" className="btn-ghost px-3" onClick={() => setCursor(new Date(year, month - 1, 1))}>Zurück</button>
        <h2 className="text-lg font-semibold capitalize">{label}</h2>
        <button type="button" className="btn-ghost px-3" onClick={() => setCursor(new Date(year, month + 1, 1))}>Weiter</button>
      </div>
      <div className="mt-3 grid grid-cols-7 gap-1 text-xs">
        {["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"].map((day) => (
          <p key={day} className="px-1 text-faint">{day}</p>
        ))}
        {cells.map((day, index) => {
          if (!day) return <div key={`empty-${index}`} />;
          const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const who = rows.filter(([, item]) => item.from && item.until && item.from <= key && key <= item.until).map(([, item]) => item.by || "");
          return (
            <div key={key} className={`min-h-16 rounded-md border p-1 ${who.length ? "border-gold bg-gold/10" : "border-line"}`}>
              <p>{day}</p>
              {who.map((person) => <p key={person} className="truncate text-gold">{person}</p>)}
            </div>
          );
        })}
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
          <button className="btn-gold mt-3" type="submit">Speichern</button>
        </form>
      ) : null}
      {entries(rows).map(([key, item]) => (
        <article key={key} className="card card-still p-4 text-sm">
          <p className="text-xs text-faint">{item.category}</p>
          <p className="font-semibold">{item.title}</p>
          <p className="text-muted">{item.description}</p>
          {item.image ? <img src={item.image} alt="" className="mt-2 max-h-36 rounded-md object-cover" /> : null}
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
      <button className="btn-gold mt-3" type="submit">Text speichern</button>
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
          <button key={item.id} type="button" className={demo === item.id ? "btn-gold" : "btn-ghost"} onClick={() => setDemo(item.id)}>
            {item.label}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {MODES.map((mode) => (
          <button key={mode.id} type="button" className={form.mode === mode.id ? "btn-gold" : "btn-ghost"} onClick={() => save({ ...form, mode: mode.id, order: mode.id === "auto" ? "" : form.order })}>
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
      <button type="button" className="btn-gold" onClick={() => save(form)}>Werte speichern</button>
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
          <button className="btn-gold" type="submit">Ausführen</button>
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
