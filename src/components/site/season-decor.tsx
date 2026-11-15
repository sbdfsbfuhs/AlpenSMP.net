import { useEffect, useState } from "react";
import { fireworksOpen, useSeason } from "@/lib/alpen/seasons";

export function SeasonalDecorations() {
  const season = useSeason();
  if (season === "default") return null;
  return (
    <div className={`season-scene season-scene-${season}`} aria-hidden="true">
      {season === "christmas" ? <Christmas /> : null}
      {season === "winter" ? <Winter /> : null}
      {season === "halloween" ? <Halloween /> : null}
      {season === "autumn" ? <Autumn /> : null}
      {season === "spring" ? <Spring /> : null}
      {season === "summer" ? <Summer /> : null}
      {season === "easter" ? <Easter /> : null}
      {season === "newyear" ? <NewYear /> : null}
    </div>
  );
}

function Snow({ count }: { count: number }) {
  return (
    <>
      {Array.from({ length: count }, (_, index) => (
        <span
          key={index}
          className="snowflake"
          style={{
            ["--left" as string]: `${5 + ((index * 37) % 90)}%`,
            ["--size" as string]: `${3 + (index % 3)}px`,
            ["--duration" as string]: `${24 + (index % 5) * 3}s`,
            ["--delay" as string]: `${-index * 2}s`,
            ["--opacity" as string]: String(0.3 + (index % 4) * 0.1),
            ["--drift" as string]: `${index % 2 === 0 ? 16 : -16}px`,
          }}
        />
      ))}
    </>
  );
}

function Christmas() {
  return (
    <>
      <svg className="season-lights-svg" viewBox="0 0 800 90" preserveAspectRatio="none">
        <path d="M0 18 Q200 62 400 28 T800 18" fill="none" stroke="#243028" strokeWidth="3" />
        {[80, 200, 320, 440, 560, 680].map((x, index) => (
          <circle key={x} className={`bulb bulb-${index % 4}`} cx={x} cy={index % 2 === 0 ? 42 : 28} r="6" />
        ))}
      </svg>
      <svg className="season-tree" viewBox="0 0 120 140">
        <polygon points="60,8 18,58 102,58" fill="#1a3a1a" />
        <polygon points="60,36 10,92 110,92" fill="#163216" />
        <polygon points="60,64 4,124 116,124" fill="#122812" />
        <rect x="50" y="124" width="20" height="16" fill="#3a241c" />
      </svg>
      <Snow count={16} />
    </>
  );
}

function Winter() {
  const flakes = [
    [6, 18, 22, 0, 0.55, 24],
    [14, 11, 16, -4, 0.35, -18],
    [22, 16, 26, -9, 0.7, 30],
    [31, 9, 14, -2, 0.4, -12],
    [39, 20, 28, -14, 0.5, 16],
    [47, 12, 18, -7, 0.8, -22],
    [55, 15, 24, -11, 0.45, 20],
    [63, 8, 13, -1, 0.3, -10],
    [71, 18, 21, -16, 0.6, 28],
    [79, 13, 17, -6, 0.5, -16],
    [88, 10, 15, -12, 0.35, 14],
    [94, 17, 27, -3, 0.65, -26],
    [11, 14, 19, -18, 0.4, 12],
    [27, 19, 30, -8, 0.55, -20],
    [43, 8, 12, -20, 0.3, 8],
    [58, 16, 23, -5, 0.75, 22],
    [74, 12, 20, -15, 0.45, -14],
    [86, 20, 32, -10, 0.5, 18],
    [18, 9, 15, -13, 0.35, -8],
    [67, 15, 25, -19, 0.6, 26],
  ];
  return (
    <>
      <span className="twinkle t1" />
      <span className="twinkle t2" />
      <span className="twinkle t3" />
      {flakes.map(([left, size, duration, delay, opacity, drift]) => (
        <span
          key={`${left}-${delay}`}
          className="flake"
          style={{
            ["--left" as string]: `${left}%`,
            ["--size" as string]: `${size}px`,
            ["--duration" as string]: `${duration}s`,
            ["--delay" as string]: `${delay}s`,
            ["--opacity" as string]: String(opacity),
            ["--drift" as string]: `${drift}px`,
          }}
        >
          ❄
        </span>
      ))}
    </>
  );
}

function Halloween() {
  return (
    <>
      <Bat className="spirit spirit-1" />
      <Bat className="spirit spirit-2" />
      <Bat className="spirit spirit-3" />
      <Ghost className="spirit spirit-4" />
      <Ghost className="spirit spirit-5" />
      <Bat className="spirit spirit-6" />
    </>
  );
}

function Bat({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 28 12" aria-hidden="true">
      <path d="M2 7 Q7 1 14 6 Q21 1 26 7 Q20 5 14 8 Q8 5 2 7Z" fill="currentColor" />
    </svg>
  );
}

function Ghost({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 16 20" aria-hidden="true">
      <path d="M3 10a5 5 0 0 1 10 0v7l-2.5-1.6L8 17l-2.5-1.6L3 17Z" fill="currentColor" />
    </svg>
  );
}

function Autumn() {
  return (
    <>
      {["a", "b", "c", "d", "e", "f"].map((id) => (
        <span key={id} className={`leaf leaf-${id}`} />
      ))}
    </>
  );
}

function Spring() {
  return (
    <>
      {["a", "b", "c", "d"].map((id) => (
        <span key={id} className={`petal petal-${id}`} />
      ))}
      <svg className="bird bird-a" viewBox="0 0 24 8"><path d="M0 6 L8 1 L16 6" fill="none" stroke="#6b8f71" strokeWidth="1.4" /></svg>
      <svg className="bird bird-b" viewBox="0 0 24 8"><path d="M0 6 L8 1 L16 6" fill="none" stroke="#6b8f71" strokeWidth="1.4" /></svg>
    </>
  );
}

function Summer() {
  return (
    <svg className="sun-mark" viewBox="0 0 80 80">
      <circle cx="40" cy="40" r="14" fill="#f2b544" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
        <line key={deg} x1="40" y1="18" x2="40" y2="8" stroke="#f2b544" strokeWidth="2" transform={`rotate(${deg} 40 40)`} />
      ))}
    </svg>
  );
}

function Easter() {
  return (
    <>
      <svg className="easter-eggs" viewBox="0 0 250 100">
        <path className="egg-grass" d="M4 91 Q42 78 80 91 T156 91 T246 91" />
        <g className="easter-egg egg-one">
          <ellipse cx="33" cy="62" rx="15" ry="22" fill="#d6b7f4" />
          <path d="M20 59 Q33 65 46 59 M22 69 Q33 74 44 69" fill="none" stroke="#fff" strokeWidth="3" />
          <circle cx="33" cy="51" r="3" fill="#fff" />
        </g>
        <g className="easter-egg egg-two">
          <ellipse cx="91" cy="67" rx="15" ry="22" fill="#f0bd83" />
          <path d="M78 61 Q91 55 104 61 M78 72 Q91 78 104 72" fill="none" stroke="#fff4dd" strokeWidth="3" />
          <circle cx="91" cy="67" r="3" fill="#fff4dd" />
        </g>
        <g className="easter-egg egg-three">
          <ellipse cx="151" cy="61" rx="15" ry="22" fill="#9fcaa1" />
          <path d="M138 57 Q151 63 164 57 M140 69 Q151 74 162 69" fill="none" stroke="#f4fff0" strokeWidth="3" />
          <circle cx="151" cy="51" r="3" fill="#f4fff0" />
        </g>
        <g className="easter-egg egg-four">
          <ellipse cx="211" cy="66" rx="15" ry="22" fill="#e69dad" />
          <path d="M198 60 Q211 54 224 60 M198 72 Q211 78 224 72" fill="none" stroke="#fff1f4" strokeWidth="3" />
          <circle cx="211" cy="66" r="3" fill="#fff1f4" />
        </g>
      </svg>
      <Butterfly className="butterfly butterfly-one" />
      <Butterfly className="butterfly butterfly-two" />
    </>
  );
}

function Butterfly({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 32 24">
      <path className="butterfly-wing wing-left" d="M16 12C9 1 1 2 4 11c2 5 7 6 12 3Z" />
      <path className="butterfly-wing wing-right" d="M16 12c7-11 15-10 12-1-2 5-7 6-12 3Z" />
      <path d="M16 9v9m0-7-4-5m4 5 4-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
    </svg>
  );
}

function NewYear() {
  const [fireworksActive, setFireworksActive] = useState(false);
  useEffect(() => {
    const update = () => setFireworksActive(fireworksOpen());
    update();
    const interval = window.setInterval(update, 60_000);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <>
      <span className="newyear-star star-a" />
      <span className="newyear-star star-b" />
      {fireworksActive ? (
        <>
          <span className="firework firework-one" />
          <span className="firework firework-two" />
          <span className="firework firework-three" />
        </>
      ) : null}
    </>
  );
}
