import { useEffect, useRef, useState, type FormEvent } from "react";
import type { StaffSession } from "@/lib/alpen/staff";
import { SecurityDenied, SecurityDown, securityJson } from "@/lib/alpen/security";

const TWO_WEEKS = 14 * 24 * 60 * 60 * 1000;

type Msg = { by?: string; text?: string; ts?: number };
type Wire = Msg & { id?: string };

export function StaffChat({ user, team = true, builder = false, dock = false }: { user: StaffSession; team?: boolean; builder?: boolean; dock?: boolean }) {
  const rooms = [
    ...(team ? [{ path: "chats/team", title: "Team" }] : []),
    ...(builder ? [{ path: "chats/builder", title: "Builder" }] : []),
  ];
  const [path, setPath] = useState(rooms[0]?.path || "chats/team");
  const active = rooms.find((room) => room.path === path) || rooms[0];
  if (!active) return null;
  return (
    <div className={`flex min-w-0 flex-col overflow-hidden rounded-2xl border border-line bg-bg shadow-lg ${dock ? "h-full" : "h-[min(72vh,740px)]"}`}>
      <header className="flex items-center gap-2 border-b border-line px-3 py-2">
        {rooms.length > 1 ? (
          <div className="flex gap-1">
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
        ) : (
          <h2 className="font-semibold">{active.title}</h2>
        )}
      </header>
      <ChatThread path={active.path} user={user} />
    </div>
  );
}

function roomOf(path: string) {
  return path.endsWith("builder") ? "builder" : "team";
}

function ChatThread({ path, user }: { path: string; user: StaffSession }) {
  const [text, setText] = useState("");
  const [draft, setDraft] = useState("");
  const [pinOpen, setPinOpen] = useState(false);
  const [remote, setRemote] = useState<Wire[]>([]);
  const [remotePin, setRemotePin] = useState<Msg | null>(null);
  const [hint, setHint] = useState("Verbinden…");
  const box = useRef<HTMLDivElement>(null);
  const stick = useRef(true);
  const [away, setAway] = useState(0);
  const room = roomOf(path);

  useEffect(() => {
    let stop = false;
    let pulling = false;
    async function pull() {
      if (pulling) return;
      pulling = true;
      try {
        const data = await securityJson<{ messages?: Wire[] }>(`/api/chat/${room}`);
        const nextPin = room === "team" ? await securityJson<Msg>("/api/chat/pin") : null;
        if (stop) return;
        setRemote(Array.isArray(data.messages) ? data.messages : []);
        setRemotePin(nextPin);
        setHint("Verbunden");
      } catch (err) {
        if (!stop) setHint(chatError(err));
      } finally {
        pulling = false;
      }
    }
    void pull();
    const timer = window.setInterval(() => void pull(), 4000);
    return () => {
      stop = true;
      window.clearInterval(timer);
    };
  }, [room]);

  const list = remote
    .filter((item) => (item.ts || 0) >= Date.now() - TWO_WEEKS)
    .map((item, index) => [item.id || `oracle-${item.ts || index}`, item] as [string, Wire])
    .sort((a, b) => (a[1].ts || 0) - (b[1].ts || 0));
  const pinned = remotePin?.text ? remotePin : null;

  useEffect(() => {
    const el = box.current;
    if (el && stick.current) {
      el.scrollTop = el.scrollHeight;
      setAway(0);
    } else if (!stick.current) {
      setAway((count) => count + 1);
    }
  }, [list.length, path]);

  async function send(event: FormEvent) {
    event.preventDefault();
    const msg = text.trim();
    if (!msg) return;
    stick.current = true;
    setHint("Sende…");
    try {
      const saved = await securityJson<Wire>(`/api/chat/${room}`, {
        method: "POST",
        body: JSON.stringify({ text: msg.slice(0, 800) }),
      });
      setRemote((current) => [...current, saved]);
      setText("");
      setHint("Verbunden");
    } catch (err) {
      setHint(chatError(err));
    }
  }

  async function removeMessage(id: string) {
    try {
      await securityJson(`/api/chat/${room}/${encodeURIComponent(id)}`, { method: "DELETE" });
      setRemote((current) => current.filter((item) => item.id !== id));
      setHint("Verbunden");
    } catch (err) {
      setHint(chatError(err));
    }
  }

  async function removePin() {
    try {
      await securityJson("/api/chat/pin", { method: "DELETE" });
      setRemotePin(null);
      setHint("Verbunden");
    } catch (err) {
      setHint(chatError(err));
    }
  }

  async function savePin(event: FormEvent) {
    event.preventDefault();
    const next = draft.trim().slice(0, 160);
    if (!next) return;
    try {
      const saved = await securityJson<Msg>("/api/chat/pin", {
        method: "PUT",
        body: JSON.stringify({ text: next }),
      });
      setRemotePin(saved);
      setDraft("");
      setPinOpen(false);
      setHint("Verbunden");
    } catch (err) {
      setHint(chatError(err));
    }
  }

  return (
    <>
      <p className={`border-b border-line px-3 py-1 text-xs ${hint === "Verbunden" ? "text-muted" : "text-ember"}`} role="status">
        {hint}
      </p>
      {pinned?.text ? (
        <p className="border-b border-brand/40 bg-brand/10 px-3 py-2 text-sm">
          <span className="text-xs font-semibold text-brand">Angepinnt</span>
          <span className="mt-0.5 block whitespace-pre-wrap">{pinned.text}</span>
          {user.role === "owner" ? (
            <button
              type="button"
              className="mt-1 text-xs text-muted underline"
              onClick={() => void removePin()}
            >
              Lösen
            </button>
          ) : null}
        </p>
      ) : null}
      <div
        ref={box}
        className="relative min-h-0 flex-1 space-y-1 overflow-y-auto bg-[radial-gradient(circle_at_20%_10%,rgb(227_27_50/0.05),transparent_28%)] px-3 py-3"
        onScroll={(event) => {
          const el = event.currentTarget;
          const near = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
          stick.current = near;
          if (near) setAway(0);
        }}
      >
        {list.map(([key, item], index) => {
          const prev = list[index - 1]?.[1];
          const mine = item.by === user.username;
          const showDay = !prev || dayKey(prev.ts) !== dayKey(item.ts);
          const grouped = Boolean(prev && !showDay && prev.by === item.by);
          const messageId = item.id;
          return (
            <div key={key}>
              {showDay ? (
                <p className="mx-auto my-3 w-fit rounded-full bg-bg-raised px-3 py-1 text-xs text-muted">{dayLabel(item.ts)}</p>
              ) : null}
              <div className={`flex ${mine ? "justify-end" : "justify-start"} ${grouped ? "mt-0.5" : "mt-2"}`}>
                <div className={`flex max-w-[85%] items-end gap-2 ${mine ? "flex-row-reverse" : ""}`}>
                {!grouped ? (
                  <span className={`grid size-7 shrink-0 place-items-center rounded-full text-[10px] font-bold ${mine ? "bg-brand text-white" : "bg-bg-raised text-brand"}`}>
                    {(item.by || "?").slice(0, 2).toUpperCase()}
                  </span>
                ) : (
                  <span className="size-7 shrink-0" />
                )}
                <div className={`min-w-0 rounded-2xl px-3 py-1.5 text-sm ${mine ? "rounded-br-md bg-brand text-white" : "rounded-bl-md border border-line bg-bg-raised"}`}>
                  {!mine && !grouped ? <p className="text-xs font-semibold text-brand">{item.by}</p> : null}
                  <p className="whitespace-pre-wrap break-words">{item.text}</p>
                  <p className={`mt-0.5 text-right text-[10px] ${mine ? "text-white/70" : "text-muted"}`}>
                    {clock(item.ts)}
                    {user.role === "owner" && messageId ? (
                      <button type="button" className="ml-2 underline" onClick={() => void removeMessage(messageId)}>
                        Löschen
                      </button>
                    ) : null}
                  </p>
                </div>
              </div>
              </div>
            </div>
          );
        })}
        {!list.length ? <p className="py-8 text-center text-sm text-muted">Noch keine Nachrichten</p> : null}
      </div>
      {away > 0 ? (
        <button
          type="button"
          className="mx-auto -mt-8 mb-1 rounded-full bg-brand px-3 py-1 text-xs font-semibold text-white"
          onClick={() => {
            stick.current = true;
            if (box.current) box.current.scrollTop = box.current.scrollHeight;
            setAway(0);
          }}
        >
          {away} neu
        </button>
      ) : null}
      {path === "chats/team" && user.role === "owner" ? (
        pinOpen ? (
          <form className="flex gap-2 border-t border-line px-3 py-2" onSubmit={(event) => void savePin(event)}>
            <input className="field" placeholder="Oben anpinnen" value={draft} onChange={(e) => setDraft(e.target.value)} />
            <button className="btn-ghost" type="submit">
              Anpinnen
            </button>
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

function chatError(error: unknown) {
  if (error instanceof SecurityDenied) return "Keine Berechtigung für diesen Chat.";
  if (error instanceof SecurityDown) return "Chatserver nicht erreichbar.";
  return "Chat-Anfrage fehlgeschlagen.";
}