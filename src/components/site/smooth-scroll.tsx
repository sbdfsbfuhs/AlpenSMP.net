import { useEffect } from "react";
import { useRouter } from "@tanstack/react-router";
import Lenis from "lenis";

let current: Lenis | null = null;

function publicPath(pathname: string) {
  return !pathname.startsWith("/team");
}

export function resetLenis() {
  const lenis = current;
  if (!lenis) {
    window.scrollTo(0, 0);
    return;
  }
  lenis.stop();
  lenis.scrollTo(0, { immediate: true, force: true });
}

export function SmoothScroll() {
  const router = useRouter();
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const coarse = window.matchMedia("(pointer: coarse)");
    if (reduce.matches || coarse.matches) return;
    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true, allowNestedScroll: true });
    current = lenis;
    let frame = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      frame = window.requestAnimationFrame(loop);
    };
    frame = window.requestAnimationFrame(loop);
    return () => {
      window.cancelAnimationFrame(frame);
      if (current === lenis) current = null;
      lenis.destroy();
    };
  }, []);
  useEffect(() => {
    const stop = router.subscribe("onBeforeNavigate", (event) => {
      if (!event.pathChanged || !publicPath(event.toLocation.pathname)) return;
      current?.stop();
    });
    const zero = router.subscribe("onBeforeRouteMount", (event) => {
      if (!event.pathChanged || !publicPath(event.toLocation.pathname)) return;
      resetLenis();
    });
    const go = router.subscribe("onRendered", (event) => {
      if (!event.pathChanged || !publicPath(event.toLocation.pathname)) return;
      window.requestAnimationFrame(() => current?.start());
    });
    return () => {
      stop();
      zero();
      go();
    };
  }, [router]);
  return null;
}
