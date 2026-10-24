import { useEffect, useRef, useState, type FormEvent } from "react";
import { useLive } from "@/components/site/staff-live";
import { entries, fbPush, fbRemove, fbSet, type StaffSession } from "@/lib/alpen/staff";

const TWO_WEEKS = 14 * 24 * 60 * 60 * 1000;

type Msg = { by?: string; text?: string; ts?: number };

export function StaffChat({ user, builder }: { user: StaffSession; builder: boolean }) {
  const rooms = [{ path: "chats/team", title: "Team" }];
  if (builder || user.role === "owner") rooms.push({ path: "chats/builder", title: "Builder" });
  const [path, setPath] = useState(rooms[0].path);
  const active = rooms.find((room) => room.path === path) || rooms[0];
  return (
    <div className="flex h-[min(72vh,740px)] overflow-hidden rounded-2xl border border-line bg-bg">
      {rooms.length > 1 ? (
        <aside className="hidden w-52 shrink-0 flex-col border-r border-line sm:flex">
          <p className="border-b border-line px-3 py-3 text-sm font-semibold">Chats</p>
          {rooms.map((room) => (
            <RoomButton key={room.path} room={room} active={room.path === active.path} onPick={setPath} />
          ))}
        </aside>
      ) : null}
      <section className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-2 border-b border-line px-3 py-3">
          {rooms.length > 1 ? (
            <div className="flex gap-1 sm:hidden">
              {rooms.map((room) => (
                <button
                  key={room.path}
                  type="button"
                  className={`rounded-full px-3 py-1 text-sm ${room.path === active.path ? "bg-brand text-white" : "border border-line"}`}
                  onClick={() => setPath(room.path)}
                >
                  {room.title}
                </button>
              ))}
            </div>
          ) : null}
          <div className="min-w-0">
            <h2 className="font-semibold">{active.title}</h2>
            <p className="text-xs text-muted">Nachrichten werden nach 14 Tagen gelöscht</p>
          </div>
        </header>
        <ChatThread path={active.path} user={user} />
      </section>
    </div>
  );
}

function RoomButton({
  room,
  active,
  onPick,
}: {
  room: { path: string; title: string };
  active: boolean;
  onPick: (path: string) => void;
}) {
  const rows = useLive<Msg>(room.path);
  const last = entries(rows).sort((a, b) => (a[1].ts || 0) - (b[1].ts || 0)).at(-1)?.[1];
  return (
    <button
      type="button"
      className={`border-b border-line px-3 py-3 text-left ${active ? "bg-brand/10" : "hover:bg-bg-raised"}`}
      onClick={() => onPick(room.path)}
    >
      <span className="block font-semibold">{room.title}</span>
      <span className="mt-1 block truncate text-xs text-muted">{last?.text || "Noch nichts"}</span>
    </button>
  );
}

function ChatThread({ path, user }: { path: string; user: StaffSession }) {
  const rows = useLive<Msg>(path);
  const pin = useLive<{ text?: string; by?: string; ts?: number }>("chats/pin");
  const [text, setText] = useState("");
  const [draft, setDraft] = useState("");
  const [pinOpen, setPinOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const stick = useRef(true);
  const list = entries(rows)
    .filter(([, item]) => (item.ts || 0) >= Date.now() - TWO_WEEKS)
    .sort((a, b) => (a[1].ts || 0) - (b[1].ts || 0));
  const pinned = path === "chats/team" ? pin.current : undefined;

  useEffect(() => {
    const limit = Date.now() - TWO_WEEKS;
    const old = entries(rows).filter(([, item]) => (item.ts || 0) < limit);
    for (const [key] of old) void fbRemove(`${path}/${key}`);
  }, [rows, path]);

  useEffect(() => {
    const el = box.current;
    if (el && stick.current) el.scrollTop = el.scrollHeight;
  }, [list.length, path]);

  function send(event: FormEvent) {
    event.preventDefault();
    const msg = text.trim();
    if (!msg) return;
    stick.current = true;
    void fbPush(path, { by: user.username, text: msg.slice(0, 800), ts: Date.now() }).then(() => setText(""));
  }

  return (
    <>
      {pinned?.text ? (
        <p className="border-b border-brand/40 bg-brand/10 px-3 py-2 text-sm">
          <span className="text-xs font-semibold text-brand">Angepinnt</span>
          <span className="mt-0.5 block whitespace-pre-wrap">{pinned.text}</span>
          {user.role === "owner" ? (
            <button type="button" className="mt-1 text-xs text-muted underline" onClick={() => void fbRemove("chats/pin/current")}>
              Lösen
            </button>
          ) : null}
        </p>
      ) : null}
      <div
        ref={box}
        className="min-h-0 flex-1 space-y-1 overflow-y-auto bg-[radial-gradient(circle_at_20%_10%,rgb(227_27_50/0.05),transparent_28%)] px-3 py-3"
        onScroll={(event) => {
          const el = event.currentTarget;
          stick.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
        }}
      >
        {list.map(([key, item], index) => {
          const prev = list[index - 1]?.[1];
          const mine = item.by === user.username;
          const showDay = !prev || dayKey(prev.ts) !== dayKey(item.ts);
          const grouped = Boolean(prev && !showDay && prev.by === item.by);
          return (
            <div key={key}>
              {showDay ? (
                <p className="mx-auto my-3 w-fit rounded-full bg-bg-raised px-3 py-1 text-xs text-muted">{dayLabel(item.ts)}</p>
              ) : null}
              <div className={`flex ${mine ? "justify-end" : "justify-start"} ${grouped ? "mt-0.5" : "mt-2"}`}>
                <div className={`max-w-[78%] rounded-2xl px-3 py-1.5 text-sm ${mine ? "rounded-br-md bg-brand text-white" : "rounded-bl-md border border-line bg-bg-raised"}`}>
                  {!mine && !grouped ? <p className="text-xs font-semibold text-brand">{item.by}</p> : null}
                  <p className="whitespace-pre-wrap break-words">{item.text}</p>
                  <p className={`mt-0.5 text-right text-[10px] ${mine ? "text-white/70" : "text-muted"}`}>
                    {clock(item.ts)}
                    {user.role === "owner" ? (
                      <button type="button" className="ml-2 underline" onClick={() => void fbRemove(`${path}/${key}`)}>
                        Löschen
                      </button>
                    ) : null}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
        {!list.length ? <p className="py-8 text-center text-sm text-muted">Noch keine Nachrichten</p> : null}
      </div>
      {path === "chats/team" && user.role === "owner" ? (
        pinOpen ? (
          <form
            className="flex gap-2 border-t border-line px-3 py-2"
            onSubmit={(event) => {
              event.preventDefault();
              if (!draft.trim()) return;
              void fbSet("chats/pin/current", { text: draft.trim().slice(0, 160), by: user.username, ts: Date.now() }).then(() => {
                setDraft("");
                setPinOpen(false);
              });
            }}
          >
            <input className="field" placeholder="Oben anpinnen" value={draft} onChange={(e) => setDraft(e.target.value)} />
            <button className="btn-ghost" type="submit">Anpinnen</button>
          </form>
        ) : (
          <div className="border-t border-line px-3 py-1">
            <button type="button" className="text-xs text-muted underline" onClick={() => setPinOpen(true)}>
              Nachricht anpinnen
            </button>
          </div>
        )
      ) : null}
      <form className="flex items-end gap-2 border-t border-line p-2" onSubmit={send}>
        <textarea
          className="field max-h-28 min-h-11 resize-none"
          rows={1}
          placeholder="Nachricht"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              event.currentTarget.form?.requestSubmit();
            }
          }}
        />
        <button className="btn-brand shrink-0" type="submit">
          Senden
        </button>
      </form>
    </>
  );
}

function dayKey(ts?: number) {
  if (!ts) return "";
  const date = new Date(ts);
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function dayLabel(ts?: number) {
  if (!ts) return "";
  const date = new Date(ts);
  const start = (value: Date) => new Date(value.getFullYear(), value.getMonth(), value.getDate()).getTime();
  const diff = Math.round((start(new Date()) - start(date)) / 86400000);
  if (diff === 0) return "Heute";
  if (diff === 1) return "Gestern";
  return date.toLocaleDateString("de-CH", { weekday: "short", day: "numeric", month: "short" });
}

function clock(ts?: number) {
  if (!ts) return "";
  return new Date(ts).toLocaleTimeString("de-CH", { hour: "2-digit", minute: "2-digit" });
}
