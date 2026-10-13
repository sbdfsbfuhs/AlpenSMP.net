import { useEffect, useState } from "react";

type Face = "digital" | "analog";

type Berlin = {
  h: string;
  m: string;
  s: string;
  date: string;
  offset: string;
};

function readBerlin(now: Date): Berlin {
  const parts = new Intl.DateTimeFormat("de-DE", {
    timeZone: "Europe/Berlin",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  const zone =
    new Intl.DateTimeFormat("de-DE", {
      timeZone: "Europe/Berlin",
      timeZoneName: "short",
    })
      .formatToParts(now)
      .find((part) => part.type === "timeZoneName")?.value ?? "";
  const named = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Berlin",
    timeZoneName: "shortOffset",
  })
    .formatToParts(now)
    .find((part) => part.type === "timeZoneName")?.value ?? "";
  const match = named.match(/([+-]\d{1,2})/);
  let offset = "UTC+1";
  if (zone === "MESZ") offset = "UTC+2";
  else if (zone === "MEZ") offset = "UTC+1";
  else if (match) offset = `UTC${match[1].length === 2 ? `${match[1][0]}${match[1][1]}` : match[1]}`;
  return {
    h: get("hour").padStart(2, "0"),
    m: get("minute").padStart(2, "0"),
    s: get("second").padStart(2, "0"),
    date: `${get("weekday")}, ${get("day")}. ${get("month")} ${get("year")}`,
    offset,
  };
}

export function BerlinClock() {
  const [now, setNow] = useState<Date | null>(null);
  const [face, setFace] = useState<Face>("digital");

  useEffect(() => {
    let timer = 0;
    const tick = () => setNow(new Date());
    const start = () => {
      window.clearInterval(timer);
      tick();
      timer = window.setInterval(tick, 1000);
    };
    const onVis = () => {
      if (document.hidden) window.clearInterval(timer);
      else start();
    };
    start();
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  const time = now ? readBerlin(now) : null;
  const h = time?.h ?? "--";
  const m = time?.m ?? "--";
  const s = time?.s ?? "--";
  const hn = Number(time?.h ?? 0);
  const mn = Number(time?.m ?? 0);
  const sn = Number(time?.s ?? 0);
  const hourDeg = (hn % 12) * 30 + mn * 0.5;
  const minDeg = mn * 6 + sn * 0.1;
  const secDeg = sn * 6;

  return (
    <div className={`berlin-clock ${face === "analog" ? "is-analog" : ""}`} role="group" aria-label="Serverzeit, Europe/Berlin">
      <div className="clock-head">
        <p className="clock-label">
          <span aria-hidden="true">🕐 </span>
          Serverzeit
        </p>
        <button
          type="button"
          className="clock-toggle"
          aria-pressed={face === "analog"}
          onClick={() => setFace((value) => (value === "digital" ? "analog" : "digital"))}
        >
          {face === "analog" ? "Digital" : "Analog"}
        </button>
      </div>
      <div className="clock-digital">
        <time className="clock-time" dateTime={now ? now.toISOString() : undefined}>
          <span className="clock-hm">
            {h}:{m}
          </span>
          <span className="clock-sec-wrap">:</span>
          <span key={s} className="clock-sec">
            {s}
          </span>
        </time>
      </div>
      <svg className="clock-analog" viewBox="0 0 120 120" aria-hidden="true">
        <circle cx="60" cy="60" r="56" fill="#14080b" stroke="rgba(255,255,255,.12)" strokeWidth="2" />
        <circle cx="60" cy="60" r="48" fill="#6e1824" />
        {Array.from({ length: 12 }, (_, i) => {
          const angle = (i / 12) * Math.PI * 2;
          const inner = i % 3 === 0 ? 36 : 42;
          return (
            <line
              key={i}
              x1={60 + Math.sin(angle) * inner}
              y1={60 - Math.cos(angle) * inner}
              x2={60 + Math.sin(angle) * 46}
              y2={60 - Math.cos(angle) * 46}
              stroke={i % 3 === 0 ? "#fff5f5" : "rgba(255,255,255,.45)"}
              strokeWidth={i % 3 === 0 ? 2.4 : 1.2}
              strokeLinecap="round"
            />
          );
        })}
        <g className="hand hand-h" style={{ transform: `rotate(${hourDeg}deg)` }}>
          <line x1="60" y1="66" x2="60" y2="38" stroke="#fff6f6" strokeWidth="4" strokeLinecap="round" />
        </g>
        <g className="hand hand-m" style={{ transform: `rotate(${minDeg}deg)` }}>
          <line x1="60" y1="70" x2="60" y2="28" stroke="#fff6f6" strokeWidth="2.4" strokeLinecap="round" />
        </g>
        <g className="hand hand-s" style={{ transform: `rotate(${secDeg}deg)` }}>
          <line x1="60" y1="74" x2="60" y2="24" stroke="#e05c5c" strokeWidth="1.4" strokeLinecap="round" />
        </g>
        <circle cx="60" cy="60" r="3.2" fill="#fff6f6" />
        <circle cx="60" cy="60" r="1.6" fill="#e05c5c" />
      </svg>
      <p className="clock-date">{time?.date ?? "Europe/Berlin"}</p>
      <div className="clock-foot">
        <p className="clock-chip">Berlin · {time?.offset ?? "UTC+1"}</p>
      </div>
    </div>
  );
}
