import { useEffect, useState } from "react";
import { fireworksOpen, useSeason } from "@/lib/alpen/seasons";

function Flakes({ count, kind }: { count: number; kind: string }) {
  return (
    <>
      {Array.from({ length: count }, (_, index) => (
        <span
          key={index}
          className={`season-bit ${kind}`}
          style={{
            ["--x" as string]: `${(index * 37) % 100}%`,
            ["--d" as string]: `${8 + (index % 7) * 1.6}s`,
            ["--delay" as string]: `${(index % 9) * -1.3}s`,
            ["--sway" as string]: `${(index % 2 === 0 ? -1 : 1) * (18 + (index % 5) * 8)}px`,
            ["--s" as string]: `${10 + (index % 4) * 4}px`,
          }}
        />
      ))}
    </>
  );
}

export function SeasonalDecorations() {
  const season = useSeason();
  const [pile, setPile] = useState(8);
  const [confetti, setConfetti] = useState(false);
  const [rockets, setRockets] = useState(false);

  useEffect(() => {
    if (season !== "christmas" && season !== "winter") return;
    const key = "alpen-snow-pile";
    const started = Number(sessionStorage.getItem(key) || Date.now());
    if (!sessionStorage.getItem(key)) sessionStorage.setItem(key, String(started));
    const tick = () => setPile(Math.min(60, 8 + (Date.now() - started) / 20000));
    tick();
    const id = window.setInterval(tick, 2000);
    return () => window.clearInterval(id);
  }, [season]);

  useEffect(() => {
    if (season !== "newyear") {
      setConfetti(false);
      setRockets(false);
      return;
    }
    setConfetti(true);
    setRockets(fireworksOpen());
    const hide = window.setTimeout(() => setConfetti(false), 30000);
    return () => window.clearTimeout(hide);
  }, [season]);

  return (
    <div className="season-decor" data-season-decor={season} aria-hidden="true">
      {season === "christmas" || season === "winter" ? (
        <>
          <Flakes count={season === "christmas" ? 16 : 8} kind="season-snow" />
          <div className="season-pile" style={{ height: pile }} />
        </>
      ) : null}
      {season === "christmas" ? (
        <>
          <div className="season-lights" />
          <span className="season-branch season-branch-l" />
          <span className="season-branch season-branch-r" />
        </>
      ) : null}
      {season === "halloween" ? (
        <>
          <div className="season-fog" />
          <Flakes count={3} kind="season-bat" />
          <Flakes count={4} kind="season-pumpkin" />
        </>
      ) : null}
      {season === "easter" ? (
        <>
          <Flakes count={10} kind="season-egg" />
          <Flakes count={3} kind="season-butterfly" />
        </>
      ) : null}
      {season === "spring" ? <Flakes count={14} kind="season-petal" /> : null}
      {season === "summer" ? (
        <>
          <span className="season-sun" />
          <Flakes count={8} kind="season-bubble" />
        </>
      ) : null}
      {season === "autumn" ? <Flakes count={12} kind="season-leaf" /> : null}
      {season === "winter" ? <div className="season-frost" /> : null}
      {confetti ? <Flakes count={22} kind="season-confetti" /> : null}
      {rockets ? <Flakes count={4} kind="season-rocket" /> : null}
    </div>
  );
}
