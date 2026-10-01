import { Send, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { answerQuestion } from "@/lib/alpen/assistant";
import {
  holdMs,
  MASCOT_DEFAULT,
  mascotLine,
  pickIdle,
  readOrder,
  waitMs,
  type Act,
  type MascotSettings,
} from "@/lib/alpen/mascot";
import { MascotView } from "@/components/site/mascot-3d";
import { fbGet } from "@/lib/alpen/staff";

type Msg = { role: "bot" | "user"; text: string };

const STARTER = "Hallo. Frag mich zu den Regeln – oder sag einfach: setz dich, schlaf, wink.";

export function SiteMascot({
  line,
  align = "start",
  inset = false,
  bias,
}: {
  line: string;
  align?: "start" | "end";
  inset?: boolean;
  bias?: Act;
}) {
  const spot = useRef<HTMLSpanElement>(null);
  const [settings, setSettings] = useState<MascotSettings>(MASCOT_DEFAULT);
  const [act, setAct] = useState<Act>("stand");
  const [chat, setChat] = useState(false);
  const [closing, setClosing] = useState(false);
  const [box, setBox] = useState<{ left: number; bottom: number; width: number } | null>(null);
  const [text, setText] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([{ role: "bot", text: STARTER }]);
  const [gaze, setGaze] = useState({ x: 0, y: 0 });
  const [quip, setQuip] = useState<string | null>(null);
  const lockUntil = useRef(0);
  const actRef = useRef<Act>("stand");
  const settingsRef = useRef(settings);
  const biasRef = useRef(bias);
  actRef.current = act;
  settingsRef.current = settings;
  biasRef.current = bias;

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
      if (settings.mode !== "stand") setAct("stand");
      return;
    }
    setAct(settings.mode);
  }, [settings.mode, settings.order]);

  useEffect(() => {
    const ordered = readOrder(settings.order);
    const looping = settings.mode === "auto" || settings.mode === "stand" || settings.mode === "interactive";
    if (!looping || (settings.mode === "auto" && ordered && ordered !== "auto")) return;
    let timer = 0;
    let stopped = false;
    const later = (fn: () => void, ms: number) => {
      timer = window.setTimeout(() => {
        if (!stopped) fn();
      }, ms);
    };
    const loop = () => {
      later(() => {
        if (Date.now() < lockUntil.current) {
          later(loop, lockUntil.current - Date.now());
          return;
        }
        const next = pickIdle(settingsRef.current, biasRef.current, settingsRef.current.mode === "stand" ? "small" : "full");
        setAct(next);
        later(() => {
          if (next === "sleep") {
            setAct("wake");
            later(() => {
              setAct("walk");
              later(() => {
                setAct("stand");
                loop();
              }, holdMs("walk"));
            }, holdMs("wake"));
            return;
          }
          setAct("stand");
          loop();
        }, holdMs(next));
      }, waitMs(settingsRef.current));
    };
    loop();
    return () => {
      stopped = true;
      window.clearTimeout(timer);
    };
  }, [settings.mode, settings.order, settings.idle, settings.pace, settings.sleep, settings.sit, settings.special]);

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
    setClosing(false);
    setChat(true);
    setAct("up");
    place();
  }

  function closeChat() {
    setClosing(true);
    window.setTimeout(() => {
      setChat(false);
      setClosing(false);
      if (settingsRef.current.mode === "auto" && !readOrder(settingsRef.current.order)) setAct("stand");
    }, 320);
  }

  useEffect(() => {
    const scripts = [
      [line, "Wirklich. Frag einfach. haha"],
      ["Frag mich nach der IP.", "Oder nach den Regeln. haha"],
      ["Java oder Bedrock?", "Beides geht. haha"],
      ["Darf ich X-Ray?", "Nein. hahaha"],
      ["Klick mich.", "Ich beiß nicht. haha"],
      ["Homes sind erlaubt.", "Claims auch. haha"],
      ["Bin ich müde?", "Nein. Doch. haha"],
      ["Wer klaut Diamanten?", "Ich sag nichts. haha"],
    ];
    let stop = false;
    const wait = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));
    const run = async () => {
      await wait(800);
      while (!stop) {
        if (actRef.current === "sleep") {
          setQuip(null);
          await wait(1200);
          continue;
        }
        const script = scripts[Math.floor(Math.random() * scripts.length)] ?? [line];
        let text = "";
        setQuip("");
        for (const ch of script[0] ?? "") {
          if (stop) return;
          text += ch;
          setQuip(text);
          await wait(36 + Math.random() * 34);
        }
        await wait(650);
        if (!stop && script[1] && Math.random() < 0.75) {
          while (text.length && !stop) {
            text = text.slice(0, -1);
            setQuip(text);
            await wait(22);
          }
          await wait(160);
          for (const ch of script[1]) {
            if (stop) return;
            text += ch;
            setQuip(text);
            await wait(34);
          }
        }
        await wait(1800);
        if (!stop) setQuip(null);
        await wait(4200 + Math.random() * 4800);
      }
    };
    void run();
    return () => {
      stop = true;
    };
  }, [line]);

  useEffect(() => {
    const follow = (event: globalThis.MouseEvent) => {
      const node = spot.current;
      if (!node || actRef.current === "sleep") return;
      const rect = node.getBoundingClientRect();
      const x = (event.clientX - (rect.left + rect.width / 2)) / 280;
      const y = (rect.top + rect.height * 0.42 - event.clientY) / 280;
      setGaze({
        x: Math.max(-1, Math.min(1, x)),
        y: Math.max(-0.75, Math.min(0.75, y)),
      });
    };
    window.addEventListener("mousemove", follow);
    return () => window.removeEventListener("mousemove", follow);
  }, []);

  function pet() {
    const mode = settingsRef.current.mode;
    const ordered = readOrder(settingsRef.current.order);
    if (mode !== "auto" && mode !== "interactive") return;
    if (ordered && ordered !== "auto") return;
    if (actRef.current === "sleep") return;
    const previous = actRef.current;
    setAct("pet");
    window.setTimeout(() => {
      if (actRef.current === "pet") setAct(previous === "pet" ? "stand" : previous);
    }, 1600);
  }

  function send() {
    const q = text.trim();
    if (!q) return;
    const intent = readOrder(q);
    if (intent) window.dispatchEvent(new CustomEvent("alpen-mascot-order", { detail: intent }));
    const asked = /[?]|\b(was|wie|wo|wann|darf|gibt|regel|ip|mod|home|tpa)\b/i.test(q);
    const reply = intent && !asked ? mascotLine(intent) : asked && intent ? `${mascotLine(intent)} ${answerQuestion(q)}` : answerQuestion(q);
    setText("");
    setMsgs((list) => [...list, { role: "user", text: q }, { role: "bot", text: reply }]);
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

  const unit = (
    <div className={`flex py-6 ${align === "end" ? "justify-end" : "justify-start"}`}>
      <button
        type="button"
        className="mascot-unit"
        aria-label="AlpenKI öffnen"
        onMouseEnter={pet}
        onClick={openChat}
      >
        <span className={`mascot-stage ${chat ? "is-chat" : ""}`} ref={spot}>
          {quip !== null && !chat ? (
            <span className="mascot-quip">
              {quip}
              <i className="mascot-caret" />
            </span>
          ) : null}
          {act === "pet" ? <span className="hearts">♥</span> : null}
          <MascotView act={act} gaze={chat ? { x: 0, y: 0.85 } : act === "sleep" ? { x: 0, y: 0 } : gaze} />
        </span>
      </button>
      {chat && box
        ? createPortal(
            <section
              className={`thought ${closing ? "is-closing" : ""}`}
              style={{ left: box.left, bottom: box.bottom, width: box.width }}
              role="dialog"
              aria-label="AlpenKI"
            >
              <header className="flex items-center justify-between border-b border-line px-4 py-3">
                <p className="text-sm font-semibold">AlpenKI</p>
                <button type="button" className="grid size-9 place-items-center text-muted" aria-label="Schließen" onClick={closeChat}>
                  <X className="size-4" />
                </button>
              </header>
              <div className="flex max-h-80 flex-col gap-3 overflow-y-auto px-4 py-4">
                {msgs.map((msg, i) => (
                  <p key={i} className={msg.role === "user" ? "ki-user" : "ki-bot"}>
                    {msg.text}
                  </p>
                ))}
              </div>
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

  if (inset) return unit;
  return <div className="shell">{unit}</div>;
}

