import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { MascotView } from "@/components/site/mascot-art";
import type { SiteNotice } from "@/components/site/live";
import type { Act } from "@/lib/alpen/mascot";
import { SITE } from "@/lib/alpen/site";

type RunObstacle = { x: number; h: number; kind: "stone" | "ore" | "log" };

function drawBuddy(ctx: CanvasRenderingContext2D, x: number, feet: number, t: number, air: boolean, alive: boolean) {
  const bob = air ? 0 : Math.sin(t * 10) * 2;
  const step = air ? 0.6 : Math.sin(t * 12);
  ctx.save();
  ctx.translate(x, feet + bob);
  ctx.fillStyle = "rgba(0,0,0,0.28)";
  ctx.beginPath();
  ctx.ellipse(18, 4, air ? 12 : 16, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#d9a88f";
  ctx.lineWidth = 5;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(12, -18);
  ctx.lineTo(12 - step * 8, -2);
  ctx.moveTo(24, -18);
  ctx.lineTo(24 + step * 8, -2);
  ctx.stroke();
  ctx.fillStyle = "#f0cbb8";
  ctx.beginPath();
  ctx.ellipse(18, -34, 16, 18, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#e1062c";
  ctx.beginPath();
  ctx.ellipse(18, -42, 12, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(26, -42, 5, 14 + Math.sin(t * 4) * 2);
  ctx.fillStyle = "#f0cbb8";
  ctx.beginPath();
  ctx.arc(18, -60, 16, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(8, -78, 5, 11, -0.3, 0, Math.PI * 2);
  ctx.ellipse(28, -78, 5, 11, 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#e1062c";
  ctx.beginPath();
  ctx.ellipse(8, -78, 2.2, 6, -0.3, 0, Math.PI * 2);
  ctx.ellipse(28, -78, 2.2, 6, 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#1a0c10";
  if (!alive) {
    ctx.fillRect(10, -62, 6, 2);
    ctx.fillRect(20, -62, 6, 2);
  } else {
    ctx.beginPath();
    ctx.arc(12, -60, 2.3, 0, Math.PI * 2);
    ctx.arc(24, -60, 2.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.fillRect(13, -62, 1.2, 1.2);
    ctx.fillRect(25, -62, 1.2, 1.2);
  }
  ctx.strokeStyle = "#6a0d22";
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.arc(18, -55, 5, 0.25, Math.PI - 0.25);
  ctx.stroke();
  const swing = air ? -0.9 : Math.sin(t * 10) * 0.8;
  ctx.strokeStyle = "#f0cbb8";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(30, -38);
  ctx.lineTo(40, -30 + swing * 10);
  ctx.stroke();
  ctx.save();
  ctx.translate(40, -30 + swing * 10);
  ctx.rotate(-0.7 + swing * 0.4);
  ctx.strokeStyle = "#6b4423";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(18, -16);
  ctx.stroke();
  ctx.fillStyle = "#d5dbe3";
  ctx.fillRect(12, -22, 16, 5);
  ctx.restore();
  ctx.restore();
}

function drawRun(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  frame: {
    t: number;
    lift: number;
    ground: number;
    obstacles: RunObstacle[];
    clouds: { x: number; y: number; s: number }[];
    scroll: number;
    points: number;
    alive: boolean;
  },
) {
  const { t, lift, ground, obstacles, clouds, scroll, points, alive } = frame;
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, "#3a1424");
  sky.addColorStop(1, "#12080c");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = "#4a2030";
  ctx.beginPath();
  ctx.moveTo(0, ground - 10);
  for (let x = 0; x <= w; x += 16) {
    const y = ground - 78 - Math.sin((x + scroll * 0.22) * 0.012) * 26 - Math.sin((x + scroll * 0.15) * 0.02) * 14;
    ctx.lineTo(x, y);
  }
  ctx.lineTo(w, ground);
  ctx.lineTo(0, ground);
  ctx.fill();
  ctx.fillStyle = "rgba(255,246,246,0.16)";
  for (const cloud of clouds) {
    ctx.beginPath();
    ctx.ellipse(cloud.x, cloud.y, 36 * cloud.s, 14 * cloud.s, 0, 0, Math.PI * 2);
    ctx.ellipse(cloud.x + 24 * cloud.s, cloud.y + 4, 22 * cloud.s, 12 * cloud.s, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  const size = 28;
  const offset = scroll % size;
  for (let x = -size; x < w + size; x += size) {
    const bx = x - offset;
    ctx.fillStyle = "#6a4a32";
    ctx.fillRect(bx, ground, size - 2, h - ground);
    ctx.fillStyle = "#3f7a3a";
    ctx.fillRect(bx, ground, size - 2, 8);
  }
  for (const obstacle of obstacles) {
    if (obstacle.kind === "log") {
      ctx.fillStyle = "#5c3a22";
      ctx.fillRect(obstacle.x + 6, ground - obstacle.h, 12, obstacle.h);
      ctx.fillStyle = "#2f6b32";
      ctx.beginPath();
      ctx.arc(obstacle.x + 12, ground - obstacle.h, 22, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = obstacle.kind === "ore" ? "#5c616c" : "#7a7e88";
      ctx.fillRect(obstacle.x, ground - obstacle.h, 34, obstacle.h);
      if (obstacle.kind === "ore") {
        ctx.fillStyle = "#e1062c";
        ctx.fillRect(obstacle.x + 6, ground - obstacle.h + 10, 7, 6);
        ctx.fillRect(obstacle.x + 18, ground - obstacle.h + 22, 8, 6);
      }
    }
  }
  drawBuddy(ctx, 92, ground - lift, t, lift > 1, alive);
  ctx.fillStyle = "#fff6f6";
  ctx.font = "700 18px sans-serif";
  ctx.fillText(String(points), 16, 28);
}

function freshObstacles(): RunObstacle[] {
  return [
    { x: 820, h: 48, kind: "stone" },
    { x: 1120, h: 70, kind: "ore" },
  ];
}

function OfflineRun() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const playingRef = useRef(false);
  const jumpRef = useRef<() => void>(() => {});
  const resetRef = useRef<() => void>(() => {});
  const [playing, setPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [over, setOver] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const ground = 228;
    const clouds = [
      { x: 80, y: 42, s: 1 },
      { x: 340, y: 74, s: 0.75 },
      { x: 560, y: 36, s: 1.15 },
    ];
    const state = { lift: 0, vy: 0, points: 0, alive: true, scroll: 0, obstacles: freshObstacles() };
    const jump = () => {
      if (!playingRef.current || !state.alive) return;
      if (state.lift <= 0.6) state.vy = 11.6;
    };
    jumpRef.current = jump;
    resetRef.current = () => {
      state.lift = 0;
      state.vy = 0;
      state.points = 0;
      state.alive = true;
      state.scroll = 0;
      state.obstacles = freshObstacles();
      playingRef.current = true;
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.code === "Space" || event.key === " ") {
        event.preventDefault();
        jump();
      }
    };
    window.addEventListener("keydown", onKey);
    let raf = 0;
    let shown = 0;
    const loop = (now: number) => {
      const t = now / 1000;
      if (playingRef.current && state.alive) {
        state.vy -= 0.48;
        state.lift = Math.max(0, state.lift + state.vy);
        if (state.lift === 0) state.vy = 0;
        const speed = 4.1 + Math.min(3.4, state.points * 0.08);
        state.scroll += speed;
        for (const obstacle of state.obstacles) obstacle.x -= speed;
        const first = state.obstacles[0];
        if (first && first.x < -70) {
          state.obstacles.shift();
          const roll = Math.random();
          const kind: RunObstacle["kind"] = roll < 0.34 ? "ore" : roll < 0.62 ? "log" : "stone";
          state.obstacles.push({
            x: 780 + Math.random() * 240,
            h: kind === "log" ? 86 : 42 + Math.random() * 40,
            kind,
          });
          state.points += 1;
          if (state.points !== shown) {
            shown = state.points;
            setScore(state.points);
          }
        }
        const px = 100;
        const py = ground - 62 - state.lift;
        for (const obstacle of state.obstacles) {
          const width = obstacle.kind === "log" ? 26 : 34;
          const top = ground - obstacle.h;
          const hitsX = px < obstacle.x + width - 4 && px + 34 > obstacle.x + 6;
          const hitsY = py + 56 > top + 8 && state.lift < obstacle.h - 10;
          if (hitsX && hitsY) state.alive = false;
        }
        if (!state.alive) {
          playingRef.current = false;
          setPlaying(false);
          setOver(true);
        }
      }
      for (const cloud of clouds) {
        cloud.x -= playingRef.current ? 0.4 : 0.12;
        if (cloud.x < -90) cloud.x = canvas.width + 40;
      }
      drawRun(ctx, canvas.width, canvas.height, {
        t,
        lift: state.lift,
        ground,
        obstacles: state.obstacles,
        clouds,
        scroll: state.scroll,
        points: state.points,
        alive: state.alive,
      });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div className="w-full max-w-2xl text-left">
      <canvas ref={canvasRef} width={720} height={280} className="w-full rounded-3xl border border-line bg-[#12080c]" />
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          className="btn-gold"
          onClick={() => {
            setScore(0);
            setOver(false);
            setPlaying(true);
            resetRef.current();
          }}
        >
          {playing ? "Läuft" : over ? "Nochmal" : "Spielen"}
        </button>
        <button type="button" className="btn-ghost" onClick={() => jumpRef.current()}>
          Springen
        </button>
        <span className="text-sm text-muted">{over ? `Vorbei. Punkte: ${score}` : "Leertaste springt über Stein, Erz und Bäume."}</span>
      </div>
    </div>
  );
}

export function LockScreen({ notice }: { notice: SiteNotice }) {
  const [mood, setMood] = useState<Act>("sleep");
  useEffect(() => {
    const id = window.setInterval(() => {
      setMood((current) => (current === "sleep" ? "mine" : "sleep"));
    }, 9000);
    return () => window.clearInterval(id);
  }, []);
  return (
    <div className="grid min-h-screen place-items-center bg-bg px-6 py-10 text-center text-fg">
      <div className="w-full max-w-6xl">
        <p className="kicker">AlpenSMP</p>
        <h1 className="display mt-3 text-4xl">{notice.title || "Kurz offline"}</h1>
        <p className="mx-auto mt-3 max-w-3xl text-lg text-muted">{notice.message}</p>
        <div className="mt-8 flex flex-col items-center justify-center gap-8 lg:flex-row lg:items-end">
          <OfflineRun />
          <div className="w-full max-w-sm shrink-0">
            <p className="mb-2 inline-block rounded-full border border-line bg-surface px-4 py-2 text-sm">
              {mood === "sleep" ? "Pssst. Gerade offline, ich penn kurz." : "Gerade offline. Ich bau solange weiter."}
            </p>
            <div className="mx-auto h-[28rem] w-80">
              <MascotView act={mood} gaze={{ x: -0.2, y: 0.05 }} />
            </div>
          </div>
        </div>
        {notice.button_label ? (
          <a className="btn-gold mt-6 inline-flex" href={notice.button_href || SITE.discord}>
            {notice.button_label}
          </a>
        ) : null}
        <p className="mt-8 text-sm text-faint">
          <Link to="/team" className="text-fg underline">
            Team-Anmeldung
          </Link>
        </p>
      </div>
    </div>
  );
}
