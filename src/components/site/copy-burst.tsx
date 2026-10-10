import { useEffect, useRef, useState, type CSSProperties, type MouseEvent, type ReactNode } from "react";

type Bit = {
  id: number;
  dx: number;
  dy: number;
  rot: number;
  delay: number;
  size: number;
  color: string;
};

type Burst = { bits: Bit[]; x: number; y: number };

const COLORS = ["var(--color-gold)", "var(--color-ice)"];

function makeBits(): Bit[] {
  const count = 16 + Math.floor(Math.random() * 5);
  return Array.from({ length: count }, (_, i) => {
    const spread = (Math.random() - 0.5) * 92;
    return {
      id: i,
      dx: spread,
      dy: -(36 + Math.random() * 58),
      rot: (Math.random() - 0.5) * 180,
      delay: Math.random() * 90,
      size: 3 + Math.random() * 4,
      color: COLORS[i % COLORS.length],
    };
  });
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
  const [burst, setBurst] = useState<Burst | null>(null);
  const busy = useRef(false);
  const timer = useRef(0);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  async function copy(text: string, event?: MouseEvent<HTMLElement>) {
    if (busy.current) return false;
    busy.current = true;
    const ok = await writeClipboard(text);
    if (!ok) {
      busy.current = false;
      return false;
    }
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const host = event?.currentTarget.getBoundingClientRect();
    const x = event && host ? event.clientX - host.left : (host?.width ?? 0) / 2;
    const y = event && host ? event.clientY - host.top : (host?.height ?? 0) / 2;
    setBurst(reduce ? null : { bits: makeBits(), x, y });
    setCopied(true);
    if (!reduce) navigator.vibrate?.(30);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      setCopied(false);
      setBurst(null);
      busy.current = false;
    }, 1500);
    return true;
  }

  return { copied, burst, copy };
}

export function CopyBurst({ burst }: { burst: Burst | null }) {
  if (!burst) return null;
  return (
    <span className="copy-burst" aria-hidden="true">
      <i className="copy-flash" style={{ "--x": `${burst.x}px`, "--y": `${burst.y}px` } as CSSProperties} />
      <i className="copy-ring" style={{ "--x": `${burst.x}px`, "--y": `${burst.y}px` } as CSSProperties} />
      {burst.bits.map((bit) => (
        <i
          key={bit.id}
          className="copy-spark"
          style={
            {
              "--x": `${burst.x}px`,
              "--y": `${burst.y}px`,
              "--dx": `${bit.dx}px`,
              "--dy": `${bit.dy}px`,
              "--rot": `${bit.rot}deg`,
              "--delay": `${bit.delay}ms`,
              "--size": `${bit.size}px`,
              "--color": bit.color,
            } as CSSProperties
          }
        />
      ))}
    </span>
  );
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
      <CopyBurst burst={burst.burst} />
      {burst.copied ? <CopyTick /> : null}
      <span>{burst.copied ? "Kopiert!" : children}</span>
    </button>
  );
}
