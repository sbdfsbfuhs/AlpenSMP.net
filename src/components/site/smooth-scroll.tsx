import { useEffect } from "react";
import Lenis from "lenis";

export function SmoothScroll() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const coarse = window.matchMedia("(pointer: coarse)");
    if (reduce.matches || coarse.matches) return;
    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true, allowNestedScroll: true });
    let frame = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      frame = window.requestAnimationFrame(loop);
    };
    frame = window.requestAnimationFrame(loop);
    return () => {
      window.cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, []);
  return null;
}
