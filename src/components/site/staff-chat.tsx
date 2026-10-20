import { useState } from "react";
import { useLive } from "@/components/site/staff-live";
import { entries, fbPush, fbRemove, fbSet, formatWhen, type StaffSession } from "@/lib/alpen/staff";

export function StaffChat({ user, builder }: { user: StaffSession; builder: boolean }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <ChatRoom path="chats/team" title="Team" user={user} />
      {builder || user.role === "owner" ? <ChatRoom path="chats/builder" title="Builder" user={user} /> : null}
    </div>
  );
}

function ChatRoom({ path, title, user }: { path: string; title: string; user: StaffSession }) {
  const rows = useLive<{ by?: string; text?: string; ts?: number }>(path);
  const pin = useLive<{ text?: string; by?: string; ts?: number }>("chats/pin");
  const [text, setText] = useState("");
  const [draft, setDraft] = useState("");
  const list = entries(rows).sort((a, b) => (a[1].ts || 0) - (b[1].ts || 0)).slice(-80);
  const pinned = path === "chats/team" ? pin.current : undefined;
  return (
    <section className="card card-still p-4">
      <h2 className="text-lg font-semibold">{title}</h2>
      {path === "chats/team" && pinned?.text ? (
        <p className="mt-3 rounded-md border border-brand bg-brand/10 px-3 py-2 text-sm">
          {pinned.text}
          {user.role === "owner" ? (
            <button type="button" className="btn-ghost ml-2 px-3" onClick={() => void fbRemove("chats/pin/current")}>Weg</button>
          ) : null}
        </p>
      ) : null}
      {path === "chats/team" && user.role === "owner" ? (
        <form
          className="mt-3 flex gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            if (!draft.trim()) return;
            void fbSet("chats/pin/current", { text: draft.trim().slice(0, 160), by: user.username, ts: Date.now() }).then(() => setDraft(""));
          }}
        >
          <input className="field" placeholder="Oben anpinnen, zum Beispiel Restart" value={draft} onChange={(e) => setDraft(e.target.value)} />
          <button className="btn-ghost" type="submit">Anpinnen</button>
        </form>
      ) : null}
      <ul className="mt-3 max-h-80 space-y-2 overflow-auto p-1">
        {list.map(([key, item]) => (
          <li key={key} className="rounded-md border border-line px-3 py-2 text-sm">
            <p><span className="font-semibold">{item.by}</span> <span className="text-xs text-faint">{formatWhen(item.ts)}</span></p>
            <p className="mt-1 whitespace-pre-wrap">{item.text}</p>
            {user.role === "owner" ? (
              <button type="button" className="btn-ghost mt-2 px-3" onClick={() => void fbRemove(`${path}/${key}`)}>Löschen</button>
            ) : null}
          </li>
        ))}
        {!list.length ? <li className="text-sm text-muted">Noch keine Nachrichten</li> : null}
      </ul>
      <form
        className="mt-3 flex gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          const msg = text.trim();
          if (!msg) return;
          void fbPush(path, { by: user.username, text: msg.slice(0, 800), ts: Date.now() }).then(() => setText(""));
        }}
      >
        <input className="field" placeholder="Nachricht" value={text} onChange={(e) => setText(e.target.value)} />
        <button className="btn-brand" type="submit">Senden</button>
      </form>
    </section>
  );
}

