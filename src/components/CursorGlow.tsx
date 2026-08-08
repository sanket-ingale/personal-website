import { useEffect, useRef } from "react";

/**
 * Pointer lens with physicality:
 * - Weight: the lens lerps toward the cursor instead of sticking to it.
 * - Velocity flare: radius scales with cursor speed.
 * - Idle breathing: at rest the radius gently oscillates.
 * - Spotlight surfaces ([data-spotlight], e.g. cards and game tiles) get
 *   local glow coordinates for their own clipped glow, and sit above this
 *   global lens in z-index so their background occludes it naturally.
 * - Touch: follows the finger, fades on lift; quick tap fires a pulse ring.
 * - prefers-reduced-motion: static lens follows the pointer directly,
 *   no loop, no breathing, no pulses.
 */
export function CursorGlow() {
  const layerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Targets (raw pointer) vs current (eased lens position).
    let tx = -500;
    let ty = -500;
    let cx = -500;
    let cy = -500;
    let radius = 120;
    let raf = 0;
    let running = false;
    let visible = false;
    let touchFade: ReturnType<typeof setTimeout> | undefined;
    let downAt = 0;
    let downX = 0;
    let downY = 0;

    const write = () => {
      layer.style.setProperty("--mx", `${cx}px`);
      layer.style.setProperty("--my", `${cy}px`);
      layer.style.setProperty("--glow-r", `${radius}px`);
    };

    const loop = (t: number) => {
      if (!running) return;
      // Weight: ease toward the pointer.
      const dx = tx - cx;
      const dy = ty - cy;
      cx += dx * 0.16;
      cy += dy * 0.16;

      // Velocity flare: fast cursor -> wide bright lens; settle when still.
      const speed = Math.hypot(dx, dy);
      const flare = Math.min(90, speed * 0.9);
      // Idle breathing once the lens has caught up.
      const breath = speed < 2 ? Math.sin(t * 0.0016) * 8 : 0;
      radius += (120 + flare + breath - radius) * 0.12;

      write();
      raf = requestAnimationFrame(loop);
    };

    const start = () => {
      if (running || reduced) return;
      running = true;
      raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    const show = () => {
      visible = true;
      layer.style.opacity = "1";
      start();
    };
    const hide = () => {
      visible = false;
      layer.style.opacity = "0";
      // Let the fade finish, then stop burning frames.
      setTimeout(() => {
        if (!visible) stop();
      }, 450);
    };

    const onMove = (e: PointerEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      if (reduced) {
        // No physics under reduced motion: direct, static placement.
        cx = tx;
        cy = ty;
        write();
      }
      show();
      if (e.pointerType !== "mouse") clearTimeout(touchFade);

      // Spotlight surfaces (cards, game tiles, header): local coordinates
      // for their own clipped ::after glow. They sit above this global
      // lens in z-index (see [data-spotlight] in index.css), so their own
      // opaque background naturally occludes it — no need to hide it.
      const spot = (e.target as Element | null)?.closest?.("[data-spotlight]") as HTMLElement | null;
      if (spot) {
        const r = spot.getBoundingClientRect();
        spot.style.setProperty("--cx", `${e.clientX - r.left}px`);
        spot.style.setProperty("--cy", `${e.clientY - r.top}px`);
      }
    };

    const onDown = (e: PointerEvent) => {
      downAt = performance.now();
      downX = e.clientX;
      downY = e.clientY;
      if (e.pointerType !== "mouse") {
        tx = cx = e.clientX;
        ty = cy = e.clientY;
        clearTimeout(touchFade);
        show();
        if (reduced) write();
      }
    };

    const pulse = (px: number, py: number) => {
      if (reduced) return;
      const ring = document.createElement("div");
      ring.className = "tap-pulse";
      ring.style.left = `${px}px`;
      ring.style.top = `${py}px`;
      document.body.appendChild(ring);
      ring.addEventListener("animationend", () => ring.remove());
    };

    const onUp = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") {
        const quick = performance.now() - downAt < 250;
        const still = Math.hypot(e.clientX - downX, e.clientY - downY) < 12;
        if (quick && still) pulse(e.clientX, e.clientY);
        clearTimeout(touchFade);
        touchFade = setTimeout(hide, 400);
      }
    };

    const onLeave = () => hide();
    const onVis = () => (document.hidden ? stop() : visible && start());

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    window.addEventListener("pointercancel", onUp, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    document.addEventListener("visibilitychange", onVis);

    return () => {
      stop();
      clearTimeout(touchFade);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return <div ref={layerRef} className="glow-layer" aria-hidden="true" />;
}
