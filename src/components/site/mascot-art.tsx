import { useId } from "react";
import type { CSSProperties } from "react";
import type { Act } from "@/lib/alpen/mascot";

type Gaze = { x: number; y: number };

const SIT_LIKE = new Set<Act>(["stand", "walk", "hop", "mine", "bored", "stumble", "yawn", "wake", "stretch", "up", "surprise"]);

export function MascotView({
  act,
  gaze,
  cling = false,
  preview = false,
}: {
  act: Act;
  gaze: Gaze;
  cling?: boolean;
  preview?: boolean;
}) {
  const pose = SIT_LIKE.has(act) ? "sit" : act;
  const raw = useId().replace(/:/g, "");
  const fur = `fur-${raw}`;
  const scarf = `scarf-${raw}`;
  return (
    <span
      className={`mascot-figure pose-${pose} ${cling ? "is-cling" : ""} ${preview ? "is-preview" : ""}`}
      style={{ "--lx": `${gaze.x * 2.4}px`, "--ly": `${gaze.y * -2}px` } as CSSProperties}
    >
      <svg className="mascot-art" viewBox="0 0 140 156" aria-hidden="true">
        <defs>
          <linearGradient id={fur} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff8ee" />
            <stop offset="1" stopColor="#e8c9a6" />
          </linearGradient>
          <linearGradient id={scarf} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#ff5a6e" />
            <stop offset="1" stopColor="#e1062c" />
          </linearGradient>
        </defs>
        <g className="stool">
          <ellipse cx="70" cy="148" rx="30" ry="6.5" fill="#2a1618" />
          <rect x="56" y="140" width="8" height="10" rx="2" fill="#3a2224" />
          <rect x="76" y="140" width="8" height="10" rx="2" fill="#3a2224" />
        </g>
        <g className="tail">
          <ellipse cx="112" cy="126" rx="16" ry="11" fill={`url(#${fur})`} stroke="#3a241c" strokeWidth="2.6" />
        </g>
        <g className="live">
          <ellipse cx="68" cy="120" rx="34" ry="24" fill={`url(#${fur})`} stroke="#3a241c" strokeWidth="2.6" />
          <g className="paw paw-l">
            <ellipse cx="46" cy="134" rx="11" ry="8" fill="#fff8ee" stroke="#3a241c" strokeWidth="2.6" />
          </g>
          <g className="scarf">
            <path d="M42 104c10 12 42 16 54 0-8 10-18 14-27 14s-19-4-27-14z" fill={`url(#${scarf})`} />
            <path d="M88 110l12 22-8-16z" fill="#e1062c" />
          </g>
          <g className="head">
            <g className="ear ear-l">
              <ellipse cx="44" cy="62" rx="11" ry="13" fill="#e8c9a6" stroke="#3a241c" strokeWidth="2.6" />
              <ellipse cx="44" cy="64" rx="5" ry="7" fill="#f3b7b4" />
            </g>
            <g className="ear ear-r">
              <ellipse cx="96" cy="62" rx="11" ry="13" fill="#e8c9a6" stroke="#3a241c" strokeWidth="2.6" />
              <ellipse cx="96" cy="64" rx="5" ry="7" fill="#f3b7b4" />
            </g>
            <circle cx="70" cy="80" r="34" fill={`url(#${fur})`} stroke="#3a241c" strokeWidth="2.6" />
            <ellipse className="cheek" cx="44" cy="90" rx="8" ry="4.5" fill="#f4a3a6" />
            <ellipse className="cheek" cx="96" cy="90" rx="8" ry="4.5" fill="#f4a3a6" />
            <g className="eyes">
              <ellipse cx="57" cy="78" rx="7.5" ry="8.5" fill="#1a120f" />
              <ellipse cx="83" cy="78" rx="7.5" ry="8.5" fill="#1a120f" />
              <g className="pupils">
                <circle cx="59.5" cy="75.5" r="2.4" fill="#fff" />
                <circle cx="85.5" cy="75.5" r="2.4" fill="#fff" />
              </g>
              <g className="lids">
                <path d="M48 78 Q57 88 66 78 Q57 86 48 78" fill="#e8c9a6" />
                <path d="M74 78 Q83 88 92 78 Q83 86 74 78" fill="#e8c9a6" />
              </g>
            </g>
            <path className="mouth" d="M62 96q8 8 16 0" fill="none" stroke="#3a241c" strokeWidth="2.2" strokeLinecap="round" />
            <g className="teeth">
              <rect x="67" y="96" width="3.2" height="4" rx="0.6" fill="#fff" stroke="#3a241c" strokeWidth="0.7" />
              <rect x="71.2" y="96" width="3.2" height="4" rx="0.6" fill="#fff" stroke="#3a241c" strokeWidth="0.7" />
            </g>
          </g>
          <g className="paw paw-r">
            <ellipse cx="98" cy="116" rx="9" ry="13" fill="#fff8ee" stroke="#3a241c" strokeWidth="2.6" />
          </g>
        </g>
      </svg>
      {pose === "sleep" ? <span className="zzz">z z z</span> : null}
    </span>
  );
}
