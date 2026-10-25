import { useSeason } from "@/lib/alpen/seasons";

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
        <span key={index} className={`snowflake snow-${index % 5}`} />
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
      <Snow count={12} />
    </>
  );
}

function Winter() {
  return (
    <>
      <span className="twinkle t1" />
      <span className="twinkle t2" />
      <span className="twinkle t3" />
      <Snow count={10} />
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
    <svg className="easter-eggs" viewBox="0 0 220 70">
      <ellipse cx="30" cy="46" rx="14" ry="18" fill="#f6c6ea" />
      <ellipse cx="78" cy="50" rx="14" ry="18" fill="#a8d5a2" />
      <ellipse cx="126" cy="46" rx="14" ry="18" fill="#fde68a" />
      <ellipse cx="174" cy="50" rx="14" ry="18" fill="#c4b5fd" />
    </svg>
  );
}

function NewYear() {
  return (
    <>
      <span className="burst b1" />
      <span className="burst b2" />
      <span className="burst b3" />
    </>
  );
}
