import { Send, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { replyTo, type KiAction } from "@/lib/alpen/assistant";
import {
  holdMs,
  MASCOT_DEFAULT,
  mascotLine,
  readOrder,
  type Act,
  type MascotSettings,
} from "@/lib/alpen/mascot";
import { MascotView } from "@/components/site/mascot-art";
import { DiscordLink, TikTokLink } from "@/components/site/shell";
import { fbGet } from "@/lib/alpen/staff";

type Msg = { role: "bot" | "user"; text: string; actions?: KiAction[] };

// Art. 50 Abs. 1 AI Act kann einen Hinweis verlangen, wenn ein KI-System direkt mit Personen spricht.
// AlpenKI ist eine feste Antworttabelle, kein Sprachmodell. Der Hinweis steht trotzdem sofort im Chat,
// damit niemand eine menschliche Antwort erwartet. Siehe /ki-transparenz.
const STARTER = "Ich bin ein automatischer Assistent, kein Mensch. Frag mich zur IP, zu SwissRed oder zu den Regeln – oder sag: setz dich, schlaf, wink.";
const PROMPTS = ["Wer ist der Owner?", "Wo wohnt SwissRed?", "Welche Befehle gibt es?", "Darf ich X-Ray?"];

function BotReply({
  text,
  actions,
  scroller,
}: {
  text: string;
  actions?: KiAction[];
  scroller: { current: HTMLDivElement | null };
}) {
  const [count, setCount] = useState(0);
  const done = count >= text.length;
  useEffect(() => {
    if (done) return;
    const id = window.setTimeout(() => setCount((value) => Math.min(text.length, value + 1)), 14);
    return () => window.clearTimeout(id);
  }, [count, done, text]);
  useEffect(() => {
    const node = scroller.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [count, scroller]);
  return (
    <div className="ki-bot">
      <p>
        {text.slice(0, count)}
        {done ? null : <i className="mascot-caret" />}
      </p>
      {done && actions?.length ? (
        <div className="mt-2 flex flex-wrap gap-2">
          {actions.map((action) =>
            action.href.includes("discord") ? (
              <DiscordLink key={action.label}>{action.label}</DiscordLink>
            ) : action.href.includes("tiktok") ? (
              <TikTokLink key={action.label}>{action.label}</TikTokLink>
            ) : (
              <a key={action.label} className="ki-chip" href={action.href}>
                {action.label}
              </a>
            ),
          )}
        </div>
      ) : null}
    </div>
  );
}

export function SiteMascot({
  line,
  align = "start",
  inset = false,
  bias,
  home = "index",
}: {
  line: string;
  align?: "start" | "end";
  inset?: boolean;
  bias?: Act;
  home?: string;
}) {
  const spot = useRef<HTMLSpanElement>(null);
  const [settings, setSettings] = useState<MascotSettings>(MASCOT_DEFAULT);
  const [act, setAct] = useState<Act>("sit");
  const [chat, setChat] = useState(false);
  const [closing, setClosing] = useState(false);
  const [box, setBox] = useState<{ left: number; bottom: number; width: number } | null>(null);
  const [text, setText] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([{ role: "bot", text: STARTER }]);
  const [gaze, setGaze] = useState({ x: 0, y: 0 });
  const [hidden, setHidden] = useState(false);
  const [away, setAway] = useState(false);
  const [spotPos, setSpotPos] = useState<{ x: number; y: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef(false);
  const chatRef = useRef(false);
  const lastTouch = useRef(Date.now());
  const logRef = useRef<HTMLDivElement>(null);
  const lockUntil = useRef(0);
  const actRef = useRef<Act>("sit");
  const settingsRef = useRef(settings);
  actRef.current = act;
  settingsRef.current = settings;
  chatRef.current = chat;

  useEffect(() => {
    const pull = () => {
      fbGet<MascotSettings>("mascotSettings")
        .then((value) => {
          if (value && typeof value === "object") setSettings({ ...MASCOT_DEFAULT, ...value });
        })
        .catch(() => {});
    };
    pull();
    const id = window.setInterval(pull, 8000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const onOrder = (event: Event) => {
      const detail = (event as CustomEvent<Act | "auto">).detail;
      if (detail === "auto") {
        lockUntil.current = 0;
        setAct("stand");
        return;
      }
      if (detail) {
        setAct(detail);
        lockUntil.current = Date.now() + holdMs(detail) + 5000;
      }
    };
    const onOpen = () => openChat();
    window.addEventListener("alpen-mascot-order", onOrder);
    window.addEventListener("alpen-open-ki", onOpen);
    return () => {
      window.removeEventListener("alpen-mascot-order", onOrder);
      window.removeEventListener("alpen-open-ki", onOpen);
    };
  }, []);

  useEffect(() => {
    const ordered = readOrder(settings.order);
    if (settings.mode === "auto") {
      if (ordered && ordered !== "auto") setAct(ordered);
      return;
    }
    if (settings.mode === "custom") {
      setAct(ordered && ordered !== "auto" ? ordered : "stand");
      return;
    }
    if (settings.mode === "interactive" || settings.mode === "idle" || settings.mode === "stand") {
      setAct("sit");
      return;
    }
    setAct(settings.mode);
  }, [settings.mode, settings.order]);

  useEffect(() => {
    setHidden(window.localStorage.getItem("alpen-mascot-hidden") === "1");
  }, []);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.sessionStorage.getItem("alpen-waved") === "1") return;
    window.sessionStorage.setItem("alpen-waved", "1");
    setAct("wave");
    const id = window.setTimeout(() => setAct((current) => (current === "wave" ? "sit" : current)), 2000);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    const onFocus = (event: FocusEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target || target.closest(".thought") || target.closest(".mascot-dock")) return;
      if (target.matches("input, textarea, select")) setAway(true);
    };
    const onBlur = () => setAway(false);
    document.addEventListener("focusin", onFocus);
    document.addEventListener("focusout", onBlur);
    const viewport = window.visualViewport;
    const onResize = () => {
      if (!viewport) return;
      setAway(window.innerHeight - viewport.height > 140);
    };
    viewport?.addEventListener("resize", onResize);
    return () => {
      document.removeEventListener("focusin", onFocus);
      document.removeEventListener("focusout", onBlur);
      viewport?.removeEventListener("resize", onResize);
    };
  }, []);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const fine = window.matchMedia("(pointer: fine)").matches;
    let timer = 0;
    let stopped = false;
    const plan = () => {
      const wait = fine ? 12000 + Math.random() * 8000 : 30000 + Math.random() * 30000;
      timer = window.setTimeout(() => {
        if (stopped) return;
        const mode = settingsRef.current.mode;
        const ordered = readOrder(settingsRef.current.order);
        const current = actRef.current;
        const quiet = Date.now() - lastTouch.current > (fine ? 50000 : 70000);
        if (mode === "auto" && !ordered && !chatRef.current && !dragRef.current && Date.now() >= lockUntil.current) {
          if (quiet && current !== "sleep" && current !== "wave") setAct("sleep");
          else if (!quiet && current === "sit" && (fine || Math.random() < 0.35)) {
            const extra = (["look", "scratch", "scarf"] as Act[])[Math.floor(Math.random() * 3)] ?? "look";
            setAct(extra);
            window.setTimeout(() => {
              if (["look", "scratch", "scarf"].includes(actRef.current)) setAct("sit");
            }, 1600);
          }
        }
        plan();
      }, wait);
    };
    plan();
    return () => {
      stopped = true;
      window.clearTimeout(timer);
    };
  }, []);

  function place() {
    const node = spot.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    const width = Math.min(420, window.innerWidth - 24);
    let left = rect.left + rect.width / 2 - width / 2;
    left = Math.max(12, Math.min(left, window.innerWidth - width - 12));
    setBox({ left, bottom: Math.max(12, window.innerHeight - rect.top + 12), width });
  }

  function openChat() {
    lastTouch.current = Date.now();
    setClosing(false);
    setChat(true);
    if (actRef.current === "sleep") setAct("sit");
    else {
      setAct("wave");
      window.setTimeout(() => setAct((current) => (current === "wave" ? "sit" : current)), 2000);
    }
    place();
  }

  function closeChat() {
    setClosing(true);
    window.setTimeout(() => {
      setChat(false);
      setClosing(false);
      if (settingsRef.current.mode === "auto" && !readOrder(settingsRef.current.order)) setAct("sit");
    }, 320);
  }

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const follow = (event: globalThis.MouseEvent) => {
      const node = spot.current;
      if (!node || actRef.current === "sleep" || actRef.current === "pet") return;
      const rect = node.getBoundingClientRect();
      const x = (event.clientX - (rect.left + rect.width / 2)) / 180;
      const y = (rect.top + rect.height * 0.42 - event.clientY) / 180;
      setGaze({
        x: Math.max(-1, Math.min(1, x)),
        y: Math.max(-0.75, Math.min(0.75, y)),
      });
    };
    window.addEventListener("mousemove", follow);
    return () => window.removeEventListener("mousemove", follow);
  }, []);

  function onPointerDown(event: React.PointerEvent<HTMLButtonElement>) {
    if (event.button !== 0 || event.pointerType !== "mouse") return;
    const node = event.currentTarget;
    const width = node.offsetWidth;
    const height = node.offsetHeight;
    dragRef.current = false;
    lastTouch.current = Date.now();
    const move = (ev: PointerEvent) => {
      if (Math.hypot(ev.clientX - event.clientX, ev.clientY - event.clientY) > 4) {
        dragRef.current = true;
        setDragging(true);
      }
      const x = ev.clientX - width * 0.5;
      const y = ev.clientY - height * 0.22;
      setSpotPos({
        x: Math.min(window.innerWidth - 28, Math.max(-width + 36, x)),
        y: Math.min(window.innerHeight - 24, Math.max(-8, y)),
      });
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      setDragging(false);
      if (dragRef.current) {
        lastTouch.current = Date.now();
        setAct("sit");
      }
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  }

  function pet() {
    const mode = settingsRef.current.mode;
    const ordered = readOrder(settingsRef.current.order);
    if (mode !== "auto" && mode !== "interactive") return;
    if (ordered && ordered !== "auto") return;
    if (actRef.current === "sleep" || dragRef.current) return;
    lastTouch.current = Date.now();
    setAct("pet");
    window.setTimeout(() => {
      if (actRef.current === "pet") setAct("sit");
    }, 1400);
  }

  function send(raw?: string) {
    const q = (raw ?? text).trim();
    if (!q) return;
    const intent = readOrder(q);
    if (intent) window.dispatchEvent(new CustomEvent("alpen-mascot-order", { detail: intent }));
    const asked = /[?]|\b(was|wie|wo|wann|darf|gibt|regel|ip|mod|home|tpa|wer|welche)\b/i.test(q);
    const reply = intent && !asked ? { text: mascotLine(intent), actions: [] as KiAction[] } : replyTo(q);
    setText("");
    setMsgs((list) => [...list, { role: "user", text: q }, { role: "bot", text: reply.text, actions: reply.actions }]);
    lastTouch.current = Date.now();
  }

  useEffect(() => {
    if (!chat) return;
    place();
    const onMove = () => place();
    window.addEventListener("scroll", onMove, true);
    window.addEventListener("resize", onMove);
    return () => {
      window.removeEventListener("scroll", onMove, true);
      window.removeEventListener("resize", onMove);
    };
  }, [chat]);

  useEffect(() => {
    const node = logRef.current;
    if (!node) return;
    node.scrollTop = node.scrollHeight;
  }, [msgs, chat]);

  function hideMascot() {
    window.localStorage.setItem("alpen-mascot-hidden", "1");
    setHidden(true);
  }

  if (hidden) {
    const restore =
      typeof document === "undefined"
        ? null
        : createPortal(
            <button
              type="button"
              className="mascot-restore"
              onClick={() => {
                window.localStorage.removeItem("alpen-mascot-hidden");
                setHidden(false);
              }}
            >
              AlpenKI
            </button>,
            document.body,
          );
    return inset ? restore : <div className="shell">{restore}</div>;
  }

  const mascot = (
    <div className={`mascot-dock ${away ? "is-away" : ""}`} style={spotPos ? { left: spotPos.x, top: spotPos.y, right: "auto", bottom: "auto" } : undefined}>
      <button type="button" className="mascot-hide" onClick={hideMascot}>
        Ausblenden
      </button>
      <button
        type="button"
        className={`mascot-unit ${dragging ? "is-drag" : ""}`}
        aria-label="AlpenKI öffnen"
        onPointerDown={onPointerDown}
        onPointerEnter={(event) => {
          if (event.pointerType === "mouse") pet();
        }}
        onClick={(event) => {
          if (dragRef.current) {
            dragRef.current = false;
            event.preventDefault();
            return;
          }
          lastTouch.current = Date.now();
          if (actRef.current === "sleep") {
            setAct("sit");
            return;
          }
          openChat();
        }}
      >
        <span className={`mascot-stage ${chat ? "is-chat" : ""}`} ref={spot}>
          {act === "pet" ? (
            <span className="hearts" aria-hidden="true">
              ♥
            </span>
          ) : null}
          <MascotView act={act} gaze={act === "sleep" || act === "pet" ? { x: 0, y: 0 } : gaze} cling={dragging} />
        </span>
      </button>
      {chat && box && typeof document !== "undefined"
        ? createPortal(
            <section
              className={`thought ${closing ? "is-closing" : ""}`}
              style={{ left: box.left, bottom: box.bottom, width: box.width }}
              role="dialog"
              aria-label="AlpenKI, automatischer Assistent, kein Mensch"
            >
              <header className="flex items-center justify-between border-b border-line px-4 py-3">
                <div>
                  <p className="text-sm font-semibold">AlpenKI</p>
                  <p className="text-xs text-muted">Automatischer Assistent, kein Mensch.</p>
                </div>
                <button type="button" className="grid size-9 place-items-center text-muted" aria-label="Schließen" onClick={closeChat}>
                  <X className="size-4" />
                </button>
              </header>
              <div ref={logRef} className="flex max-h-80 flex-col gap-3 overflow-y-auto px-4 py-4">
                {msgs.map((msg, i) =>
                  msg.role === "user" ? (
                    <div key={i} className="ki-user">
                      <p>{msg.text}</p>
                    </div>
                  ) : (
                    <BotReply key={i} text={msg.text} actions={msg.actions} scroller={logRef} />
                  ),
                )}
              </div>
              {msgs.length === 1 ? (
                <div className="flex flex-wrap gap-2 px-4 pb-2">
                  {PROMPTS.map((prompt) => (
                    <button key={prompt} type="button" className="ki-chip" onClick={() => send(prompt)}>
                      {prompt}
                    </button>
                  ))}
                </div>
              ) : null}
              <form
                className="flex gap-2 border-t border-line p-3"
                onSubmit={(event) => {
                  event.preventDefault();
                  send();
                }}
              >
                <input className="field" value={text} maxLength={200} placeholder="Frag mich oder sag: setz dich" aria-label="Nachricht eingeben" onChange={(e) => setText(e.target.value)} />
                <button type="submit" className="grid size-11 shrink-0 place-items-center rounded-md bg-gold text-fg" aria-label="Senden">
                  <Send className="size-4" />
                </button>
              </form>
            </section>,
            document.body,
          )
        : null}
    </div>
  );
  const unit = typeof document === "undefined" ? null : createPortal(mascot, document.body);

  if (inset) return unit;
  return <div className="shell">{unit}</div>;
}

