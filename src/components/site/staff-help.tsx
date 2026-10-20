import { useState } from "react";
import { archive, useLive } from "@/components/site/staff-live";
import { Neu } from "@/components/site/staff-shared";
import { entries, fbPush, fbUpdate, formatWhen, freshStamp, type ModItem, type StaffSession } from "@/lib/alpen/staff";

export function HelpDesk({ user, note, act, moderate }: { user: StaffSession; note: (text: string) => void; act: boolean; moderate: boolean }) {
  const data = useLive<ModItem>("helpRequests");
  const rows = entries(data).filter(([, item]) => !item.archived);
  return (
    <div className="space-y-3">
      {rows.map(([key, item]) => (
        <article key={key} className={`card card-still cmd-in p-5${freshStamp(item.ts, item.updatedAt) ? " mark-new" : ""}`}>
          <p className="font-semibold">{item.by}<Neu ts={item.ts} updatedAt={item.updatedAt} /></p>
          <p className="mt-2 text-sm">{item.msg}</p>
          <p className="mt-1 text-xs text-faint">{formatWhen(item.ts)} {item.status ? `· ${item.status}` : ""}</p>
          <ul className="mt-3 space-y-2">
            {Object.values(item.replies ?? {}).map((reply, index) => (
              <li key={index} className="rounded-md bg-bg px-3 py-2 text-sm">
                <span className="font-semibold">{reply.by}: </span>{reply.text}
              </li>
            ))}
          </ul>
          {act ? <ReplyBox id={key} user={user} ticket={item.ticketCode} note={note} /> : null}
          {act ? (
            <button type="button" className="btn-ghost mt-3" onClick={() => void fbUpdate(`helpRequests/${key}`, { status: "erledigt", doneBy: user.username, updatedAt: Date.now() }).then(() => note("Als erledigt markiert"))}>
              Erledigt
            </button>
          ) : null}
          {moderate ? (
            <button type="button" className="btn-ghost mt-3" onClick={() => void archive("helpRequests", key, user, note)}>Archivieren</button>
          ) : null}
        </article>
      ))}
      {!rows.length ? <p className="text-muted">Keine offenen Anfragen</p> : null}
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
        void fbPush(`helpRequests/${id}/replies`, payload).then(async () => {
          if (ticket) {
            await fbPush(`tickets/${ticket}/replies`, payload);
            await fbUpdate(`tickets/${ticket}`, { status: "beantwortet" });
          }
          setText("");
          note("Antwort gesendet");
        });
      }}
    >
      <input className="field" value={text} onChange={(e) => setText(e.target.value)} placeholder="Antwort" />
      <button className="btn-brand" type="submit">Senden</button>
    </form>
  );
}

