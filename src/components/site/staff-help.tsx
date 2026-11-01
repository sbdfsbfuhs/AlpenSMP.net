import { useState } from "react";
import { useLive } from "@/components/site/staff-live";
import { Neu } from "@/components/site/staff-shared";
import { entries, fbPush, fbUpdate, formatWhen, freshStamp, type ModItem, type StaffSession } from "@/lib/alpen/staff";

type Filter = "alle" | "offen" | "bearbeitung" | "geschlossen";
type NoteRow = { by?: string; text?: string; ts?: number };

const CATEGORIES = ["alle", "Bug", "Frage", "Beschwerde", "Sonstiges"];

function bucket(status?: string) {
  if (status === "bearbeitung") return "bearbeitung";
  if (status === "geschlossen" || status === "erledigt" || status === "beantwortet") return "geschlossen";
  return "offen";
}

export function HelpDesk({ user, note, act }: { user: StaffSession; note: (text: string) => void; act: boolean; moderate?: boolean }) {
  const data = useLive<ModItem & { internal?: Record<string, NoteRow> }>("helpRequests");
  const [status, setStatus] = useState<Filter>("offen");
  const [category, setCategory] = useState("alle");
  const [open, setOpen] = useState<string | null>(null);
  const rows = entries(data).filter(([, item]) => !item.archived);
  const visible = rows.filter(([, item]) => {
    if (status !== "alle" && bucket(item.status) !== status) return false;
    if (category !== "alle" && (item.category || "Sonstiges") !== category) return false;
    return true;
  });
  const current = open ? rows.find(([key]) => key === open) : undefined;

  if (current) {
    const [key, item] = current;
    const notes = Object.entries(item.internal || {});
    return (
      <div className="space-y-4">
        <button type="button" className="btn-ghost" onClick={() => setOpen(null)}>Zurück zur Liste</button>
        <article className="card card-still p-5">
          <p className="text-xs uppercase tracking-wide text-faint">{item.category || "Sonstiges"} · {item.ticketCode || "ohne Code"}</p>
          <h2 className="mt-1 text-xl font-semibold">{item.topic || item.by}</h2>
          <p className="mt-1 text-sm text-muted">{item.by} · {formatWhen(item.ts)} · {bucket(item.status)}</p>
          <p className="mt-4 whitespace-pre-wrap">{item.msg}</p>
          {act ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {(["offen", "bearbeitung", "geschlossen"] as const).map((next) => (
                <button
                  key={next}
                  type="button"
                  className={bucket(item.status) === next ? "btn-brand px-3" : "btn-ghost px-3"}
                  onClick={() => {
                    void fbUpdate(`helpRequests/${key}`, { status: next, updatedAt: Date.now() })
                      .then(() => item.ticketCode ? fbUpdate(`tickets/${item.ticketCode}`, { status: next }) : undefined)
                      .then(() => note("Status gespeichert"))
                      .catch((err) => note(err instanceof Error ? err.message : "Status fehlgeschlagen"));
                  }}
                >
                  {next === "offen" ? "Offen" : next === "bearbeitung" ? "In Bearbeitung" : "Geschlossen"}
                </button>
              ))}
            </div>
          ) : null}
          <h3 className="mt-6 font-semibold">Antwort an den Spieler</h3>
          <ul className="mt-2 space-y-2">
            {Object.values(item.replies ?? {}).map((reply, index) => (
              <li key={index} className="rounded-md bg-bg px-3 py-2 text-sm">
                <span className="font-semibold">{reply.by}: </span>{reply.text}
              </li>
            ))}
          </ul>
          {act ? <ReplyBox id={key} user={user} ticket={item.ticketCode} note={note} /> : null}
          <h3 className="mt-6 font-semibold">Interne Notiz</h3>
          <ul className="mt-2 space-y-2">
            {notes.map(([id, row]) => (
              <li key={id} className="rounded-md border border-line px-3 py-2 text-sm">
                <span className="font-semibold">{row.by}: </span>{row.text}
              </li>
            ))}
            {!notes.length ? <li className="text-sm text-muted">Noch keine interne Notiz.</li> : null}
          </ul>
          {act ? <InternalBox id={key} user={user} note={note} /> : null}
        </article>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {(["offen", "bearbeitung", "geschlossen", "alle"] as Filter[]).map((item) => (
          <button key={item} type="button" className={item === status ? "btn-brand px-3" : "btn-ghost px-3"} onClick={() => setStatus(item)}>
            {item === "offen" ? "Offen" : item === "bearbeitung" ? "In Bearbeitung" : item === "geschlossen" ? "Geschlossen" : "Alle"}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((item) => (
          <button key={item} type="button" className={item === category ? "btn-brand px-3" : "btn-ghost px-3"} onClick={() => setCategory(item)}>
            {item === "alle" ? "Alle Arten" : item}
          </button>
        ))}
      </div>
      {visible.map(([key, item]) => (
        <button key={key} type="button" className={`card card-still w-full p-4 text-left${freshStamp(item.ts, item.updatedAt) ? " mark-new" : ""}`} onClick={() => setOpen(key)}>
          <p className="font-semibold">{item.topic || item.msg?.slice(0, 80)}<Neu ts={item.ts} updatedAt={item.updatedAt} /></p>
          <p className="mt-1 text-sm text-muted">{item.by} · {item.category || "Sonstiges"} · {item.ticketCode || "ohne Code"}</p>
          <p className="mt-1 text-xs text-faint">{formatWhen(item.ts)} · {bucket(item.status)}</p>
        </button>
      ))}
      {!visible.length ? <p className="text-muted">Keine Tickets in dieser Ansicht</p> : null}
    </div>
  );
}

function ReplyBox({ id, user, ticket, note }: { id: string; user: StaffSession; ticket?: string; note: (text: string) => void }) {
  const [text, setText] = useState("");
  return (
    <form
      className="mt-3 flex gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        if (!text.trim()) return;
        const payload = { by: user.username, text: text.trim(), ts: Date.now() };
        void fbPush(`helpRequests/${id}/replies`, payload)
          .then(async () => {
            if (ticket) {
              await fbPush(`tickets/${ticket}/replies`, payload);
              await fbUpdate(`tickets/${ticket}`, { status: "bearbeitung" });
            }
            setText("");
            note("Antwort gesendet");
          })
          .catch((err) => note(err instanceof Error ? err.message : "Antwort fehlgeschlagen"));
      }}
    >
      <input className="field" value={text} onChange={(e) => setText(e.target.value)} placeholder="Antwort an den Spieler" />
      <button className="btn-brand" type="submit">Senden</button>
    </form>
  );
}

function InternalBox({ id, user, note }: { id: string; user: StaffSession; note: (text: string) => void }) {
  const [text, setText] = useState("");
  return (
    <form
      className="mt-3 flex gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        if (!text.trim()) return;
        void fbPush(`helpRequests/${id}/internal`, { by: user.username, text: text.trim(), ts: Date.now() })
          .then(() => {
            setText("");
            note("Notiz gespeichert");
          })
          .catch((err) => note(err instanceof Error ? err.message : "Notiz fehlgeschlagen"));
      }}
    >
      <input className="field" value={text} onChange={(e) => setText(e.target.value)} placeholder="Nur fürs Team" />
      <button className="btn-ghost" type="submit">Notiz</button>
    </form>
  );
}
