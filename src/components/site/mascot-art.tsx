import { useId } from "react";
import type { Act } from "@/lib/alpen/mascot";
import { isSeason, useSeason, type SeasonKey } from "@/lib/alpen/seasons";

type Gaze = { x: number; y: number };

const SIT_LIKE = new Set<Act>(["stand", "walk", "hop", "mine", "bored", "stumble", "stretch", "up"]);

function Eye({ cx, cy, gaze }: { cx: number; cy: number; gaze: Gaze }) {
  const lx = gaze.x * 1.2;
  const ly = gaze.y * -0.9;
  return (
    <g className="eye" transform={`translate(${lx} ${ly})`}>
      <ellipse cx={cx} cy={cy} rx={8.2} ry={9.2} fill="#1a120f" />
      <circle className="shine" cx={cx + 2.3} cy={cy - 3.2} r={2.2} fill="#fff" />
    </g>
  );
}

function moodOf(act: Act, pose: string) {
  if (pose === "sleep") return "normal";
  if (act === "yawn" || act === "wake") return "tired";
  if (pose === "pet" || pose === "wave") return "happy";
  if (act === "surprise") return "wow";
  if (pose === "look" || pose === "scratch") return "think";
  return "normal";
}

export function MascotView({
  act,
  gaze,
  cling = false,
  preview = false,
  season,
}: {
  act: Act;
  gaze: Gaze;
  cling?: boolean;
  preview?: boolean;
  season?: string;
}) {
  const pose = SIT_LIKE.has(act) ? "sit" : act;
  const mood = moodOf(act, pose);
  const liveSeason = useSeason();
  const look: SeasonKey = isSeason(season) ? season : liveSeason;
  const raw = useId().replace(/:/g, "");
  const fur = `fur-${raw}`;
  const belly = `belly-${raw}`;
  const scarf = `scarf-${raw}`;
  const waving = pose === "wave";
  return (
    <span
      className={`mascot-figure pose-${pose} mood-${mood} ${waving ? "mascot-waving" : ""} ${cling ? "is-cling" : ""} ${preview ? "is-preview" : ""}`}
      data-state={waving ? "waving" : pose}
    >
      <svg className="mascot-art" viewBox="0 0 160 180" aria-hidden="true">
        <defs>
          <radialGradient id={fur} cx="40%" cy="32%" r="75%">
            <stop offset="0" stopColor="#fffaf4" />
            <stop offset="0.55" stopColor="#f3d3b0" />
            <stop offset="1" stopColor="#e2b48c" />
          </radialGradient>
          <linearGradient id={belly} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fffdf9" />
            <stop offset="1" stopColor="#f6e6d4" />
          </linearGradient>
          <linearGradient id={scarf} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#ff6d7e" />
            <stop offset="1" stopColor="#e1062c" />
          </linearGradient>
        </defs>

        <ellipse className="ground" cx="78" cy="172" rx="42" ry="6.5" fill="#14080b" opacity="0.34" />

        <g className="stool">
          <rect x="52" y="160" width="8" height="12" rx="2" fill="#3d2226" />
          <rect x="96" y="160" width="8" height="12" rx="2" fill="#3d2226" />
          <ellipse cx="78" cy="162" rx="36" ry="7" fill="#5c3036" />
          <ellipse cx="78" cy="158" rx="36" ry="7" fill="#7a3a42" />
        </g>

        <g className="tail">
          <ellipse cx="126" cy="138" rx="20" ry="15" fill={`url(#${fur})`} stroke="#3a241c" strokeWidth="2.2" />
          <ellipse cx="136" cy="130" rx="13" ry="11" fill="#fff1e2" stroke="#3a241c" strokeWidth="2" />
          <ellipse cx="142" cy="124" rx="8" ry="7" fill="#fffaf4" />
        </g>

        <g className="live">
          <ellipse cx="76" cy="138" rx="38" ry="28" fill={`url(#${fur})`} stroke="#3a241c" strokeWidth="2.4" />
          <ellipse className="belly" cx="76" cy="146" rx="22" ry="15" fill={`url(#${belly})`} />
          <ellipse className="chin" cx="76" cy="114" rx="24" ry="6" fill="#c49670" opacity="0.32" />

          <g className="foot foot-l">
            <ellipse cx="54" cy="160" rx="12" ry="6.5" fill="#fff8ef" stroke="#3a241c" strokeWidth="2.1" />
          </g>
          <g className="foot foot-r">
            <ellipse cx="94" cy="160" rx="12" ry="6.5" fill="#fff8ef" stroke="#3a241c" strokeWidth="2.1" />
          </g>

          <g className="paw paw-l">
            <ellipse cx="44" cy="146" rx="12" ry="9" fill="#fffaf4" stroke="#3a241c" strokeWidth="2.2" />
          </g>

          <g className="scarf">
            <path d="M46 116c12 18 50 20 62 2-8 12-22 16-32 16s-22-4-30-18z" fill={`url(#${scarf})`} />
            <path d="M102 122c8 12 10 22 4 30-8-8-10-18-12-26z" fill="#c10522" />
            <ellipse cx="76" cy="126" rx="22" ry="4.5" fill="#7a0c18" opacity="0.28" />
          </g>

          <g className="arm-r">
            <path d="M100 114c16 14 22 32 16 48" fill="none" stroke="#3a241c" strokeWidth="15" strokeLinecap="round" />
            <path d="M100 114c16 14 22 32 16 48" fill="none" stroke="#f6e3cf" strokeWidth="11" strokeLinecap="round" />
            <g className="paw-r">
              <g className="paw-tip">
                <ellipse cx="116" cy="164" rx="13" ry="11" fill="#fffaf4" stroke="#3a241c" strokeWidth="2.2" />
                <path d="M109 162v6M116 160v7M123 162v6" fill="none" stroke="#e4c2a4" strokeWidth="1.3" strokeLinecap="round" />
              </g>
            </g>
          </g>

          <g className="head">
            <g className="ear ear-l">
              <ellipse cx="44" cy="72" rx="13" ry="16" fill="#f0d0b0" stroke="#3a241c" strokeWidth="2.3" />
              <ellipse cx="44" cy="76" rx="6.5" ry="9" fill="#f6b7b4" />
            </g>
            <g className="ear ear-r">
              <ellipse cx="108" cy="72" rx="13" ry="16" fill="#f0d0b0" stroke="#3a241c" strokeWidth="2.3" />
              <ellipse cx="108" cy="76" rx="6.5" ry="9" fill="#f6b7b4" />
            </g>
            <circle cx="76" cy="90" r="40" fill={`url(#${fur})`} stroke="#3a241c" strokeWidth="2.5" />
            <path className="rim" d="M104 68c10 14 8 36-4 50" fill="none" stroke="#fff7ef" strokeWidth="2.4" strokeLinecap="round" opacity="0.55" />
            <g className="hat">
              <ellipse cx="76" cy="54" rx="34" ry="7" fill="#8d2432" />
              <path d="M48 54c6-22 50-28 58-2" fill="#e1062c" stroke="#3a241c" strokeWidth="2" />
              <ellipse cx="76" cy="52" rx="30" ry="5" fill="#ff4d66" opacity="0.35" />
              <g className="feather">
                <path d="M106 42c12-18 22-12 14 6" fill="#f4e2b0" stroke="#3a241c" strokeWidth="1.3" />
              </g>
            </g>
            <ellipse className="cheek" cx="40" cy="102" rx="10" ry="6" fill="#f4a0a8" opacity="0.9" />
            <ellipse className="cheek" cx="112" cy="102" rx="10" ry="6" fill="#f4a0a8" opacity="0.9" />
            <ellipse className="nose" cx="76" cy="104" rx="5" ry="3.4" fill="#c45b68" />
            <g className="brows">
              <path className="brow brow-l" d="M46 74q10-7 18 1" fill="none" stroke="#3a241c" strokeWidth="2.2" strokeLinecap="round" />
              <path className="brow brow-r" d="M88 75q10-7 18 1" fill="none" stroke="#3a241c" strokeWidth="2.2" strokeLinecap="round" />
            </g>
            <SeasonUnder season={look} />

            <g className="face-normal">
              <g className="eyes">
                <Eye cx={58} cy={90} gaze={gaze} />
                <Eye cx={94} cy={90} gaze={gaze} />
              </g>
              <path className="mouth mouth-normal" d="M66 112q10 9 20 0" fill="none" stroke="#3a241c" strokeWidth="2.2" strokeLinecap="round" />
            </g>

            <g className="face-happy">
              <Eye cx={58} cy={90} gaze={gaze} />
              <Eye cx={94} cy={90} gaze={gaze} />
              <path className="mouth mouth-happy" d="M64 110q12 12 24 0" fill="none" stroke="#3a241c" strokeWidth="2.3" strokeLinecap="round" />
            </g>
            <g className="face-tired">
              <Eye cx={58} cy={90} gaze={gaze} />
              <Eye cx={94} cy={90} gaze={gaze} />
              <path className="mouth mouth-tired" d="M68 114h16" stroke="#3a241c" strokeWidth="2.2" strokeLinecap="round" />
            </g>
            <g className="face-wow">
              <Eye cx={58} cy={90} gaze={gaze} />
              <Eye cx={94} cy={90} gaze={gaze} />
              <ellipse className="mouth mouth-wow" cx="76" cy="116" rx="7" ry="6" fill="#1a120f" />
            </g>
            <g className="face-think">
              <Eye cx={58} cy={90} gaze={gaze} />
              <Eye cx={94} cy={90} gaze={gaze} />
              <path className="mouth mouth-think" d="M68 114q6 4 14 0" fill="none" stroke="#3a241c" strokeWidth="2.2" strokeLinecap="round" />
            </g>

            <g className="teeth">
              <rect x="72" y="112" width="3.4" height="5" rx="0.8" fill="#fff" stroke="#3a241c" strokeWidth="0.7" />
              <rect x="76.6" y="112" width="3.4" height="5" rx="0.8" fill="#fff" stroke="#3a241c" strokeWidth="0.7" />
            </g>
            <SeasonOver season={look} />
          </g>
        </g>
      </svg>
      {pose === "sleep" ? <span className="zzz">z z z</span> : null}
    </span>
  );
}

function SeasonUnder({ season }: { season: SeasonKey }) {
  if (season !== "halloween") return null;
  return (
    <g className="fit-halloween-eyes">
      <circle cx="58" cy="90" r="11" fill="#ff7a1a" />
      <circle cx="94" cy="90" r="11" fill="#ff7a1a" />
    </g>
  );
}

function SeasonOver({ season }: { season: SeasonKey }) {
  if (season === "default") return null;
  return (
    <g className="season-fit" stroke="#3a241c" strokeWidth="1.7" strokeLinejoin="round">
      {season === "halloween" ? (
        <g>
          <path d="M60 40c2-14 30-14 32 0" fill="#f08a24" />
          <ellipse cx="76" cy="40" rx="18" ry="6" fill="#e8771a" />
          <path d="M74 26c1-6 6-6 7 0" fill="none" stroke="#2f6b32" strokeWidth="1.6" />
        </g>
      ) : null}
      {season === "christmas" ? (
        <g>
          <path d="M52 48c8-30 40-32 48 0" fill="#c10522" />
          <ellipse cx="76" cy="48" rx="26" ry="6" fill="#fff" />
          <circle cx="78" cy="18" r="5.5" fill="#fff" />
        </g>
      ) : null}
      {season === "easter" ? (
        <g>
          <ellipse cx="46" cy="30" rx="7" ry="16" fill="#f6e2cc" />
          <ellipse cx="46" cy="32" rx="3.2" ry="9" fill="#f6b7b4" stroke="none" />
          <ellipse cx="106" cy="30" rx="7" ry="16" fill="#f6e2cc" />
          <ellipse cx="106" cy="32" rx="3.2" ry="9" fill="#f6b7b4" stroke="none" />
          <ellipse cx="118" cy="150" rx="10" ry="6" fill="#c4a574" />
          <ellipse cx="114" cy="146" rx="3" ry="4" fill="#f6c6ea" stroke="none" />
          <ellipse cx="120" cy="145" rx="3" ry="4" fill="#a8d5a2" stroke="none" />
          <ellipse cx="123" cy="150" rx="3" ry="4" fill="#fde68a" stroke="none" />
        </g>
      ) : null}
      {season === "newyear" ? (
        <g>
          <path d="M62 46 L76 16 L90 46 Z" fill="#ffd700" />
          <circle cx="76" cy="14" r="3.2" fill="#cc0000" />
          <rect x="48" y="36" width="4" height="6" rx="1" fill="#cc0000" stroke="none" transform="rotate(20 50 39)" />
          <rect x="108" y="34" width="4" height="6" rx="1" fill="#f5f5f5" stroke="none" transform="rotate(-16 110 37)" />
        </g>
      ) : null}
      {season === "winter" ? (
        <g>
          <path d="M48 50c4-16 52-16 56 0" fill="#7ec4d8" />
          <ellipse cx="76" cy="50" rx="30" ry="6" fill="#d7f3fb" />
          <circle cx="76" cy="34" r="5" fill="#fff" />
        </g>
      ) : null}
      {season === "spring" ? (
        <g>
          <ellipse cx="58" cy="48" rx="5" ry="3.2" fill="#f6c6ea" />
          <ellipse cx="68" cy="44" rx="5" ry="3.2" fill="#fff" />
          <ellipse cx="78" cy="42" rx="5" ry="3.2" fill="#f6c6ea" />
          <ellipse cx="88" cy="44" rx="5" ry="3.2" fill="#fff" />
          <ellipse cx="96" cy="50" rx="5" ry="3.2" fill="#a8d5a2" />
          <circle cx="76" cy="46" r="2" fill="#f2b544" stroke="none" />
        </g>
      ) : null}
      {season === "summer" ? (
        <g>
          <ellipse cx="76" cy="46" rx="36" ry="6" fill="#e6c27a" />
          <path d="M54 46c4-14 40-16 44 0" fill="#f0d48a" />
          <ellipse cx="58" cy="90" rx="12" ry="7" fill="#9fd7e8" opacity="0.35" />
          <ellipse cx="94" cy="90" rx="12" ry="7" fill="#9fd7e8" opacity="0.35" />
          <path d="M70 90h12" fill="none" />
        </g>
      ) : null}
      {season === "autumn" ? (
        <g>
          <path d="M100 58c8-10 16-8 14 2-8 1-12 2-14-2z" fill="#d4641c" />
          <path d="M108 56c2 6-4 8-8 4" fill="none" strokeWidth="1.2" />
        </g>
      ) : null}
    </g>
  );
}
