import { useId } from "react";
import type { Act } from "@/lib/alpen/mascot";

type Gaze = { x: number; y: number };

const SIT_LIKE = new Set<Act>(["stand", "walk", "hop", "mine", "bored", "stumble", "stretch", "up"]);

const EYE_R = 13.6;

function eyeTop(cy: number, r = EYE_R) {
  return cy - r + r * 0.36;
}

function eyePath(cx: number, cy: number, r = EYE_R) {
  const y = eyeTop(cy, r);
  const dx = Math.sqrt(r * r - (y - cy) ** 2);
  return `M${cx - dx} ${y}A${r} ${r} 0 1 0 ${cx + dx} ${y}Z`;
}

function Eye({ cx, cy, gaze }: { cx: number; cy: number; gaze: Gaze }) {
  const clip = useId().replace(/:/g, "");
  const d = eyePath(cx, cy);
  const top = eyeTop(cy);
  const lx = gaze.x * 2.2;
  const ly = gaze.y * -1.8;
  return (
    <g className="eye">
      <defs>
        <clipPath id={clip}>
          <path d={d} />
        </clipPath>
      </defs>
      <path d={d} fill="#3d1f0a" />
      <g clipPath={`url(#${clip})`}>
        <g className="pupils" transform={`translate(${lx} ${ly})`}>
          <circle cx={cx} cy={cy} r={EYE_R * 0.45} fill="#140c08" />
          <circle className="shine" cx={cx + 3.5} cy={cy - 3.6} r={EYE_R * 0.18} fill="#fff" />
          <circle className="shine" cx={cx - 2.6} cy={cy + 2.4} r={EYE_R * 0.08} fill="#fff" />
        </g>
      </g>
      <g className="lashes" fill="none" stroke="#3a241c" strokeWidth="1.5" strokeLinecap="round">
        <path d={`M${cx - 5.2} ${top}c-0.4-1.8-1.1-2.6-2-3`} />
        <path d={`M${cx} ${top - 0.2}c0.05-2 0.1-3.1 0.35-3.6`} />
        <path d={`M${cx + 5} ${top}c0.45-1.7 1.2-2.5 2.1-2.9`} />
      </g>
      <g className="lid">
        <ellipse cx={cx} cy={cy} rx={EYE_R + 1.8} ry={EYE_R + 2.4} fill="#f6e2cc" />
        <path
          d={`M${cx - 12} ${cy + 1.2}q12 7.2 24 0`}
          fill="none"
          stroke="#3a241c"
          strokeWidth="2.3"
          strokeLinecap="round"
        />
      </g>
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
}: {
  act: Act;
  gaze: Gaze;
  cling?: boolean;
  preview?: boolean;
}) {
  const pose = SIT_LIKE.has(act) ? "sit" : act;
  const mood = moodOf(act, pose);
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
              <path d="M48 92h20" stroke="#1a120f" strokeWidth="3" strokeLinecap="round" />
              <path d="M84 92h20" stroke="#1a120f" strokeWidth="3" strokeLinecap="round" />
              <path d="M50 96q8 4 16 0" fill="none" stroke="#c49670" strokeWidth="1.4" strokeLinecap="round" />
              <path d="M86 96q8 4 16 0" fill="none" stroke="#c49670" strokeWidth="1.4" strokeLinecap="round" />
              <path className="mouth mouth-tired" d="M68 114h16" stroke="#3a241c" strokeWidth="2.2" strokeLinecap="round" />
            </g>
            <g className="face-wow">
              <circle cx="58" cy="90" r="10" fill="#1a120f" />
              <circle cx="94" cy="90" r="10" fill="#1a120f" />
              <circle cx="61" cy="86" r="2.6" fill="#fff" />
              <circle cx="97" cy="86" r="2.6" fill="#fff" />
              <ellipse className="mouth mouth-wow" cx="76" cy="116" rx="7" ry="6" fill="#1a120f" />
            </g>
            <g className="face-think">
              <ellipse cx="58" cy="92" rx="9" ry="8" fill="#1a120f" />
              <ellipse cx="94" cy="92" rx="9" ry="8" fill="#1a120f" />
              <circle cx="60" cy="89" r="2.2" fill="#fff" />
              <circle cx="96" cy="89" r="2.2" fill="#fff" />
              <path className="mouth mouth-think" d="M68 114q6 4 14 0" fill="none" stroke="#3a241c" strokeWidth="2.2" strokeLinecap="round" />
            </g>

            <g className="teeth">
              <rect x="72" y="112" width="3.4" height="5" rx="0.8" fill="#fff" stroke="#3a241c" strokeWidth="0.7" />
              <rect x="76.6" y="112" width="3.4" height="5" rx="0.8" fill="#fff" stroke="#3a241c" strokeWidth="0.7" />
            </g>
          </g>
        </g>
      </svg>
      {pose === "sleep" ? <span className="zzz">z z z</span> : null}
    </span>
  );
}
