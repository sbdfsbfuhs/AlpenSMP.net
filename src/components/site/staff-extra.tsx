import { useEffect, useState, type FormEvent } from "react";
import { BEDROCK_COMMANDS, COMMANDS } from "@/lib/alpen/content";
import { MASCOT_DEFAULT, type Act, type MascotMode, type MascotSettings } from "@/lib/alpen/mascot";
import { can, type Area } from "@/lib/alpen/roles";
import { MascotView } from "@/components/site/mascot-3d";
import { entries, fbGet, fbPush, fbRemove, fbSet, fbUpdate, formatWhen } from "@/lib/alpen/staff";

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

export function TasksBoard({ real, view, note, username }: { real: string; view: string; note: Note; username: string }) {
  const rows = useLive<{ title?: string; text?: string; by?: string; done?: boolean; ts?: number }>("tasks");
  const edit = can(view, "tasks");
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");

  return (
    <section className="space-y-3">
      {edit ? (
        <form
          className="card card-still p-5"
          onSubmit={(event) => {
            event.preventDefault();
            if (!guard(real, "tasks", note) || !title.trim()) return;
            void fbPush("tasks", { title: title.trim(), text: text.trim(), by: username, done: false, ts: Date.now() }).then(() => {
              setTitle("");
              setText("");
              note("Aufgabe gespeichert");
            });
          }}
        >
          <h2 className="text-lg font-semibold">Aufgabe</h2>
          <input className="field mt-3" placeholder="Titel" value={title} onChange={(e) => setTitle(e.target.value)} />
          <textarea className="field mt-2 min-h-20" placeholder="Details" value={text} onChange={(e) => setText(e.target.value)} />
          <button className="btn-gold mt-3" type="submit">Speichern</button>
        </form>
      ) : null}
      {entries(rows).map(([key, item]) => (
        <article key={key} className="card card-still p-4 text-sm">
          <p className="font-semibold">{item.done ? "Erledigt · " : ""}{item.title}</p>
          <p className="mt-1 text-muted">{item.text}</p>
          <p className="mt-1 text-xs text-faint">{item.by} · {formatWhen(item.ts)}</p>
          {edit ? (
            <div className="mt-2 flex gap-2">
              <button type="button" className="btn-ghost px-3" onClick={() => guard(real, "tasks", note) && void fbUpdate(`tasks/${key}`, { done: !item.done }).then(() => note("Aktualisiert"))}>
                {item.done ? "Wieder öffnen" : "Erledigen"}
              </button>
              <button type="button" className="btn-ghost px-3" onClick={() => guard(real, "tasks", note) && void fbRemove(`tasks/${key}`).then(() => note("Entfernt"))}>
                Löschen
              </button>
            </div>
          ) : null}
        </article>
      ))}
    </section>
  );
}

export function AbsenceBoard({ real, view, note, username }: { real: string; view: string; note: Note; username: string }) {
  const rows = useLive<{ by?: string; from?: string; until?: string; reason?: string; ts?: number }>("absences");
  const edit = can(view, "absence");
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
            void fbPush("absences", { by: username, from, until, reason: reason.trim(), ts: Date.now() }).then(() => {
              setReason("");
              note("Abwesenheit gespeichert");
            });
          }}
        >
          <h2 className="text-lg font-semibold">Eigene Abwesenheit</h2>
          <label className="mt-3 block text-sm">Von<input className="field mt-1" type="date" value={from} onChange={(e) => setFrom(e.target.value)} /></label>
          <label className="mt-2 block text-sm">Bis<input className="field mt-1" type="date" value={until} onChange={(e) => setUntil(e.target.value)} /></label>
          <input className="field mt-2" placeholder="Grund" value={reason} onChange={(e) => setReason(e.target.value)} />
          <button className="btn-gold mt-3" type="submit">Speichern</button>
        </form>
      ) : null}
      {entries(rows).map(([key, item]) => (
        <article key={key} className="card card-still p-4 text-sm">
          <p className="font-semibold">{item.by}</p>
          <p className="text-muted">{item.from} bis {item.until}</p>
          <p className="text-muted">{item.reason}</p>
          {item.by === username && edit ? (
            <button type="button" className="btn-ghost mt-2 px-3" onClick={() => guard(real, "absence", note) && void fbRemove(`absences/${key}`).then(() => note("Entfernt"))}>
              Meine entfernen
            </button>
          ) : null}
        </article>
      ))}
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
