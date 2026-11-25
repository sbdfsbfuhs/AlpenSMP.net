import { useMemo, useState, type FormEvent } from "react";
import { useLive, wipe } from "@/components/site/staff-live";
import { Neu } from "@/components/site/staff-shared";
import { entries, fbPush, fbUpdate, formatWhen, freshStamp, type ModItem, type StaffSession } from "@/lib/alpen/staff";

type Filter = "alle" | "offen" | "bearbeitung" | "geschlossen";
type TicketStatus = Exclude<Filter, "alle">;
type NoteRow = { by?: string; text?: string; ts?: number };
type HelpRequest = ModItem & { internal?: Record<string, NoteRow> };

const STATUS_FILTERS: { value: Filter; label: string }[] = [
  { value: "offen", label: "Offen" },
  { value: "bearbeitung", label: "In Bearbeitung" },
  { value: "geschlossen", label: "Geschlossen" },
  { value: "alle", label: "Alle" },
];
const TICKET_STATUSES: { value: TicketStatus; label: string }[] = STATUS_FILTERS.filter(
  (item): item is { value: TicketStatus; label: string } => item.value !== "alle",
);
const CATEGORIES = ["Bug", "Frage", "Beschwerde", "Sonstiges"];

function bucket(status?: string): TicketStatus {
  if (status === "bearbeitung") return "bearbeitung";
  if (status === "geschlossen" || status === "erledigt" || status === "beantwortet") return "geschlossen";
  return "offen";
}

function statusLabel(status?: string) {
  const value = bucket(status);
  return value === "bearbeitung" ? "In Bearbeitung" : value === "geschlossen" ? "Geschlossen" : "Offen";
}

function statusStyle(status?: string) {
  const value = bucket(status);
  if (value === "bearbeitung") return "bg-sky-500/15 text-sky-200";
  if (value === "geschlossen") return "bg-emerald-500/15 text-emerald-200";
  return "bg-amber-500/15 text-amber-200";
}

function replyRows(item: HelpRequest) {
  return Object.entries(item.replies ?? {})
    .filter(([, reply]) => reply.text)
    .sort(([, first], [, second]) => (first.ts || 0) - (second.ts || 0));
}

export function HelpDesk({ user, note, act }: { user: StaffSession; note: (text: string) => void; act: boolean; moderate?: boolean }) {
  const data = useLive<HelpRequest>("helpRequests");
  const [status, setStatus] = useState<Filter>("offen");
  const [category, setCategory] = useState("alle");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const [savingStatus, setSavingStatus] = useState(false);
  const [deletingTicket, setDeletingTicket] = useState(false);

  const rows = useMemo(
    () => entries(data)
      .filter(([, item]) => !item.archived)
      .sort(([, first], [, second]) => (second.updatedAt || second.ts || 0) - (first.updatedAt || first.ts || 0)),
    [data],
  );
  const counts = useMemo(() => {
    const result: Record<Filter, number> = {
      alle: rows.length,
      offen: 0,
      bearbeitung: 0,
      geschlossen: 0,
    };
    for (const [, item] of rows) result[bucket(item.status)] += 1;
    return result;
  }, [rows]);
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const visible = rows.filter(([, item]) => {
    if (status !== "alle" && bucket(item.status) !== status) return false;
    if (category !== "alle" && (item.category || "Sonstiges") !== category) return false;
    if (!normalizedQuery) return true;
    const searchable = [
      item.topic,
      item.by,
      item.ticketCode,
      item.category,
      item.msg,
      ...Object.values(item.replies ?? {}).map((reply) => reply.text),
    ].filter(Boolean).join(" ").toLocaleLowerCase();
    return searchable.includes(normalizedQuery);
  });
  const current = open ? rows.find(([key]) => key === open) : undefined;

  async function updateStatus(key: string, item: HelpRequest, next: TicketStatus) {
    setSavingStatus(true);
    try {
      await fbUpdate(`helpRequests/${key}`, { status: next, updatedAt: Date.now() });
      if (item.ticketCode) await fbUpdate(`tickets/${item.ticketCode}`, { status: next });
      note("Status gespeichert");
    } catch (err) {
      note(err instanceof Error ? err.message : "Status fehlgeschlagen");
    } finally {
      setSavingStatus(false);
    }
  }

  async function deleteTicket(key: string, item: HelpRequest) {
    setDeletingTicket(true);
    try {
      if (await wipe("helpRequests", key, note, item.ticketCode)) setOpen(null);
    } finally {
      setDeletingTicket(false);
    }
  }

  if (current) {
    const [key, item] = current;
    const replies = replyRows(item);
    const notes = Object.entries(item.internal || {}).sort(([, first], [, second]) => (first.ts || 0) - (second.ts || 0));
    return (
      <div className="space-y-4">
        <button type="button" className="btn-ghost" onClick={() => setOpen(null)}>← Zurück zu den Anfragen</button>
        <article className="card card-still space-y-5 p-4 sm:p-6">
          <header className="border-b border-line pb-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyle(item.status)}`}>{statusLabel(item.status)}</span>
              <span className="rounded-full border border-line px-2.5 py-1 text-xs text-muted">{item.category || "Sonstiges"}</span>
              <Neu ts={item.ts} updatedAt={item.updatedAt} />
            </div>
            <h2 className="mt-3 text-xl font-semibold sm:text-2xl">{item.topic || "Support-Anfrage"}</h2>
            <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-xs text-faint">Spieler</dt>
                <dd className="mt-0.5 font-medium">{item.by || "Unbekannt"}</dd>
              </div>
              <div>
                <dt className="text-xs text-faint">Ticketnummer</dt>
                <dd className="mt-0.5 break-all font-mono text-xs">{item.ticketCode || "Keine Ticketnummer"}</dd>
              </div>
              <div>
                <dt className="text-xs text-faint">Eingereicht</dt>
                <dd className="mt-0.5">{formatWhen(item.ts)}</dd>
              </div>
            </dl>
          </header>

          <section aria-labelledby="help-request-title">
            <h3 id="help-request-title" className="font-semibold">Anliegen</h3>
            <p className="mt-2 whitespace-pre-wrap rounded-lg bg-bg p-4 text-sm leading-relaxed">
              {item.msg || "Keine Beschreibung hinterlegt."}
            </p>
          </section>

          {act ? (
            <section aria-labelledby="help-status-title">
              <h3 id="help-status-title" className="font-semibold">Bearbeitungsstatus</h3>
              <p className="mt-1 text-sm text-muted">Wähle aus, was als Nächstes mit diesem Ticket passiert.</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {TICKET_STATUSES.map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    className={bucket(item.status) === value ? "btn-brand px-3" : "btn-ghost px-3"}
                    disabled={savingStatus || bucket(item.status) === value}
                    onClick={() => void updateStatus(key, item, value)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </section>
          ) : null}

          <section aria-labelledby="help-replies-title">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 id="help-replies-title" className="font-semibold">Verlauf mit dem Spieler</h3>
              <span className="text-xs text-faint">{replies.length} {replies.length === 1 ? "Antwort" : "Antworten"}</span>
            </div>
            <ol className="mt-3 space-y-3">
              {replies.map(([id, reply]) => (
                <li key={id} className="rounded-lg border border-line p-3">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="font-semibold">{reply.by || "Team"}</span>
                    <time className="text-xs text-faint">{formatWhen(reply.ts)}</time>
                  </div>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">{reply.text}</p>
                </li>
              ))}
              {!replies.length ? <li className="rounded-lg border border-dashed border-line p-4 text-sm text-muted">Noch keine Antwort gesendet.</li> : null}
            </ol>
            {act ? <ReplyBox id={key} user={user} ticket={item.ticketCode} note={note} /> : null}
          </section>

          <section className="rounded-lg border border-amber-500/20 bg-amber-950/10 p-4" aria-labelledby="help-internal-title">
            <h3 id="help-internal-title" className="font-semibold">Interne Notizen <span className="text-xs font-normal text-muted">· nur fürs Team</span></h3>
            <ul className="mt-3 space-y-2">
              {notes.map(([id, row]) => (
                <li key={id} className="rounded-md border border-line bg-bg/70 px-3 py-2 text-sm">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="font-semibold">{row.by || "Team"}</span>
                    <time className="text-xs text-faint">{formatWhen(row.ts)}</time>
                  </div>
                  <p className="mt-1 whitespace-pre-wrap">{row.text}</p>
                </li>
              ))}
              {!notes.length ? <li className="text-sm text-muted">Noch keine interne Notiz.</li> : null}
            </ul>
            {act ? <InternalBox id={key} user={user} note={note} /> : null}
          </section>

          {user.role === "owner" ? (
            <section className="border-t border-line pt-4" aria-label="Support-Anfrage löschen">
              <p className="text-sm text-muted">Die Anfrage und ihr öffentlicher Ticketzugriff werden endgültig entfernt.</p>
              <button
                type="button"
                className="btn-ghost mt-3 px-3 text-rose-300"
                disabled={deletingTicket}
                onClick={() => void deleteTicket(key, item)}
              >
                {deletingTicket ? "Wird endgültig gelöscht …" : "Ticket endgültig löschen"}
              </button>
            </section>
          ) : null}
        </article>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <section className="card card-still space-y-4 p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-faint">Moderation &amp; Support</p>
            <h2 className="mt-1 text-xl font-semibold">Support-Anfragen</h2>
            <p className="mt-1 text-sm text-muted">Finde Anfragen, antworte Spielern und halte den Bearbeitungsstand aktuell.</p>
          </div>
          <span className="rounded-full border border-line px-3 py-1 text-sm text-muted">{counts.offen + counts.bearbeitung} noch zu bearbeiten</span>
        </div>

        <div className="flex flex-wrap gap-2" role="group" aria-label="Nach Ticketstatus filtern">
          {STATUS_FILTERS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              aria-pressed={status === value}
              className={value === status ? "btn-brand px-3" : "btn-ghost px-3"}
              onClick={() => setStatus(value)}
            >
              {label} <span className="ml-1 text-xs opacity-70">{counts[value]}</span>
            </button>
          ))}
        </div>

        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(12rem,0.45fr)]">
          <label className="block text-sm font-medium">
            Tickets durchsuchen
            <input
              className="field mt-1"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Spieler, Betreff, Ticketnummer oder Nachricht"
            />
          </label>
          <label className="block text-sm font-medium">
            Kategorie
            <select className="field mt-1" value={category} onChange={(event) => setCategory(event.target.value)}>
              <option value="alle">Alle Kategorien</option>
              {CATEGORIES.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
        </div>
        <p className="text-xs text-faint">{visible.length} von {rows.length} Anfragen angezeigt · neueste Aktivität zuerst</p>
      </section>

      <div className="space-y-3">
        {visible.map(([key, item]) => {
          const replies = replyRows(item);
          const lastActivity = item.updatedAt || item.ts;
          return (
            <button
              key={key}
              type="button"
              aria-label={`Ticket ${item.ticketCode || ""}: ${item.topic || "Support-Anfrage"} von ${item.by || "Unbekannt"} öffnen`}
              className={`card card-still w-full p-4 text-left transition hover:border-brand/50 sm:p-5${freshStamp(item.ts, item.updatedAt) ? " mark-new" : ""}`}
              onClick={() => setOpen(key)}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyle(item.status)}`}>{statusLabel(item.status)}</span>
                    <span className="rounded-full border border-line px-2.5 py-1 text-xs text-muted">{item.category || "Sonstiges"}</span>
                    <Neu ts={item.ts} updatedAt={item.updatedAt} />
                  </div>
                  <h3 className="mt-3 text-base font-semibold">{item.topic || "Support-Anfrage"}</h3>
                  <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted">{item.msg || "Keine Beschreibung hinterlegt."}</p>
                </div>
                <div className="shrink-0 text-left text-xs text-faint sm:text-right">
                  <p>{item.updatedAt ? "Letzte Aktivität" : "Eingereicht"}</p>
                  <time className="mt-1 block">{formatWhen(lastActivity)}</time>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-line pt-3 text-xs text-muted">
                <span className="font-semibold">{item.by || "Unbekannter Spieler"}</span>
                <span className="break-all font-mono">{item.ticketCode || "Keine Ticketnummer"}</span>
                <span>{replies.length} {replies.length === 1 ? "Antwort" : "Antworten"}</span>
              </div>
            </button>
          );
        })}
        {!visible.length ? (
          <div className="card card-still p-6 text-center">
            <h3 className="font-semibold">{rows.length ? "Keine passenden Anfragen" : "Noch keine Support-Anfragen"}</h3>
            <p className="mt-1 text-sm text-muted">
              {rows.length ? "Passe Suche oder Filter an, um Tickets zu finden." : "Neue Tickets erscheinen hier, sobald Spieler das Formular absenden."}
            </p>
            {rows.length && (query || category !== "alle" || status !== "offen") ? (
              <button
                type="button"
                className="btn-ghost mt-3"
                onClick={() => {
                  setQuery("");
                  setCategory("alle");
                  setStatus("alle");
                }}
              >
                Filter zurücksetzen
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function ReplyBox({ id, user, ticket, note }: { id: string; user: StaffSession; ticket?: string; note: (text: string) => void }) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  async function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = text.trim();
    if (!message || sending) return;
    setSending(true);
    const payload = { by: user.username, text: message, ts: Date.now() };
    try {
      await fbPush(`helpRequests/${id}/replies`, payload);
      const updatedAt = Date.now();
      await fbUpdate(`helpRequests/${id}`, { status: "bearbeitung", updatedAt });
      if (ticket) {
        await fbPush(`tickets/${ticket}/replies`, payload);
        await fbUpdate(`tickets/${ticket}`, { status: "bearbeitung", updatedAt });
      }
      setText("");
      note("Antwort gesendet");
    } catch (err) {
      note(err instanceof Error ? err.message : "Antwort fehlgeschlagen");
    } finally {
      setSending(false);
    }
  }

  return (
    <form className="mt-4 space-y-2" onSubmit={(event) => void send(event)}>
      <label className="block text-sm font-medium">
        Antwort an den Spieler
        <textarea
          className="field mt-1 min-h-24"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Schreibe eine hilfreiche Antwort …"
          required
        />
      </label>
      <div className="flex justify-end">
        <button className="btn-brand" type="submit" disabled={sending || !text.trim()}>
          {sending ? "Wird gesendet …" : "Antwort senden"}
        </button>
      </div>
    </form>
  );
}

function InternalBox({ id, user, note }: { id: string; user: StaffSession; note: (text: string) => void }) {
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = text.trim();
    if (!message || saving) return;
    setSaving(true);
    try {
      await fbPush(`helpRequests/${id}/internal`, { by: user.username, text: message, ts: Date.now() });
      await fbUpdate(`helpRequests/${id}`, { updatedAt: Date.now() });
      setText("");
      note("Interne Notiz gespeichert");
    } catch (err) {
      note(err instanceof Error ? err.message : "Notiz fehlgeschlagen");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="mt-4 space-y-2" onSubmit={(event) => void save(event)}>
      <label className="block text-sm font-medium">
        Neue interne Notiz
        <textarea
          className="field mt-1 min-h-20"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Hinweis für andere Teammitglieder"
          required
        />
      </label>
      <div className="flex justify-end">
        <button className="btn-ghost" type="submit" disabled={saving || !text.trim()}>
          {saving ? "Wird gespeichert …" : "Notiz speichern"}
        </button>
      </div>
    </form>
  );
}
