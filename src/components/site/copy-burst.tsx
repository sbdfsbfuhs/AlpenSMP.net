import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from "react";

const COLORS = ["#c73e3e", "#f87171", "#fbbf24", "#34d399", "#fff", "#fca5a5"];
const toasts = new WeakMap<HTMLElement, HTMLElement>();

function reduced() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function toastText(button: HTMLElement) {
  const hint = `${button.dataset.copyKind ?? ""} ${button.getAttribute("aria-label") ?? ""}`.toLowerCase();
  return hint.includes("port") ? "✓ Port kopiert!" : "✓ Kopiert!";
}

function spawnBurst(x: number, y: number) {
  const coarse = window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 700;
  const count = coarse ? 12 : 18 + Math.floor(Math.random() * 7);
  const min = coarse ? 40 : 60;
  const max = coarse ? 80 : 120;
  for (let i = 0; i < count; i++) {
    const el = document.createElement("span");
    el.className = "copy-confetti";
    const angle = Math.random() * Math.PI * 2;
    const dist = min + Math.random() * (max - min);
    const dx = Math.cos(angle) * dist;
    const dy = Math.sin(angle) * dist;
    const drop = 30 + Math.random() * 20;
    const spin = (Math.random() < 0.5 ? -1 : 1) * (180 + Math.random() * 180);
    const box = Math.random() < 0.5;
    const start = Math.random() * 360;
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.style.width = box ? "4px" : "5px";
    el.style.height = box ? "8px" : "5px";
    el.style.borderRadius = box ? "2px" : "999px";
    el.style.background = COLORS[Math.floor(Math.random() * COLORS.length)]!;
    document.body.appendChild(el);
    const anim = el.animate(
      [
        { opacity: 1, transform: `translate(-50%, -50%) rotate(${start}deg)` },
        {
          offset: 0.62,
          opacity: 1,
          transform: `translate(calc(-50% + ${dx * 0.72}px), calc(-50% + ${dy * 0.5}px)) rotate(${start + spin * 0.45}deg)`,
        },
        {
          opacity: 0,
          transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy + drop}px)) rotate(${start + spin}deg)`,
        },
      ],
      { duration: 600 + Math.random() * 200, easing: "cubic-bezier(0.25, 0.46, 0.45, 0.94)", fill: "forwards" },
    );
    const done = () => el.remove();
    anim.onfinish = done;
    anim.oncancel = done;
  }
}

function spawnToast(button: HTMLElement, text: string) {
  toasts.get(button)?.remove();
  const rect = button.getBoundingClientRect();
  const tip = document.createElement("span");
  tip.className = "copy-toast";
  tip.setAttribute("role", "status");
  tip.textContent = text;
  tip.style.left = `${rect.left + rect.width / 2}px`;
  tip.style.top = `${rect.top + rect.height / 2 - 40}px`;
  document.body.appendChild(tip);
  toasts.set(button, tip);
  const quiet = reduced();
  if (!quiet) {
    tip.animate(
      [
        { opacity: 0, transform: "translate(-50%, 0)" },
        { opacity: 1, transform: "translate(-50%, -20px)" },
      ],
      { duration: 200, easing: "ease-out", fill: "forwards" },
    );
  } else {
    tip.style.opacity = "1";
    tip.style.transform = "translate(-50%, -20px)";
  }
  window.setTimeout(() => {
    if (!tip.isConnected) return;
    const finish = () => {
      tip.remove();
      if (toasts.get(button) === tip) toasts.delete(button);
    };
    if (quiet) {
      finish();
      return;
    }
    const out = tip.animate(
      [
        { opacity: 1, transform: "translate(-50%, -20px) scale(1)" },
        { opacity: 0, transform: "translate(-50%, -40px) scale(0.9)" },
      ],
      { duration: 300, easing: "ease-in", fill: "forwards" },
    );
    out.onfinish = finish;
    out.oncancel = finish;
  }, 1600);
}

function pulse(button: HTMLElement) {
  button.querySelectorAll(".copy-pulse").forEach((node) => node.remove());
  const ring = document.createElement("span");
  ring.className = "copy-pulse";
  ring.setAttribute("aria-hidden", "true");
  button.appendChild(ring);
  const anim = ring.animate(
    [
      { transform: "scale(1)", opacity: 0.6 },
      { transform: "scale(2.5)", opacity: 0 },
    ],
    { duration: 500, easing: "ease-out", fill: "forwards" },
  );
  const done = () => ring.remove();
  anim.onfinish = done;
  anim.oncancel = done;
}

export function triggerCopyFeedback(button: HTMLElement) {
  const rect = button.getBoundingClientRect();
  if (!button.style.minWidth) button.style.minWidth = `${button.offsetWidth}px`;
  window.clearTimeout(Number(button.dataset.copyLock || 0));
  button.dataset.copyLock = String(
    window.setTimeout(() => {
      button.style.minWidth = "";
    }, 1500),
  );
  if (!reduced()) {
    spawnBurst(rect.left + rect.width / 2, rect.top + rect.height / 2);
    pulse(button);
  }
  button.style.setProperty("transition", "none");
  button.style.setProperty("background-color", "rgba(52, 211, 153, 0.25)");
  void button.offsetWidth;
  window.setTimeout(() => {
    button.style.setProperty("transition", "background-color 300ms ease");
    button.style.removeProperty("background-color");
    window.setTimeout(() => button.style.removeProperty("transition"), 320);
  }, 150);
  spawnToast(button, toastText(button));
  if (!reduced()) navigator.vibrate?.(20);
}

async function writeClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const area = document.createElement("textarea");
      area.value = text;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.left = "-9999px";
      document.body.appendChild(area);
      area.select();
      const ok = document.execCommand("copy");
      area.remove();
      return ok;
    } catch {
      return false;
    }
  }
}

export function useCopyBurst() {
  const [copied, setCopied] = useState(false);
  const timer = useRef(0);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  async function copy(text: string, event?: MouseEvent<HTMLElement>) {
    const button = event?.currentTarget ?? null;
    const ok = await writeClipboard(text);
    if (!ok) return false;
    if (button) triggerCopyFeedback(button);
    setCopied(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 1500);
    return true;
  }

  return { copied, copy };
}

export function CopyTick() {
  return (
    <svg viewBox="0 0 24 24" className="copy-tick size-4" aria-hidden="true">
      <path d="M5 12.5 10 17.5 19 7.5" />
    </svg>
  );
}

export function CopyBurstButton({
  value,
  children,
  className = "",
  ariaLabel,
}: {
  value: string;
  children: ReactNode;
  className?: string;
  ariaLabel?: string;
}) {
  const burst = useCopyBurst();
  return (
    <button
      type="button"
      className={`copy-btn relative ${burst.copied ? "is-copied" : ""} ${className}`}
      aria-label={ariaLabel}
      onClick={(event) => void burst.copy(value, event)}
    >
      <span>{burst.copied ? "✓ Kopiert" : children}</span>
    </button>
  );
}
