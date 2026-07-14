import { useEffect, useRef } from "react";

/**
 * Pointer lens with physicality:
 * - Weight: the lens lerps toward the cursor instead of sticking to it.
 * - Velocity flare: radius and hue drift scale with cursor speed.
 * - Idle breathing: at rest the radius gently oscillates.
 * - Spotlight surfaces ([data-spotlight]) get local glow coordinates.
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
    let hue = 27; // starts near the default orange accent
    // Two dot groups with independent heartbeats (see index.css).
    let dotR1 = 1;
    let dotA1 = 0.55;
    let dotR2 = 1;
    let dotA2 = 0.55;
    let raf = 0;
    let running = false;
    let visible = false;
    let touchFade: ReturnType<typeof setTimeout>;
    let downAt = 0;
    let downX = 0;
    let downY = 0;

    const write = () => {
      layer.style.setProperty("--mx", `${cx}px`);
      layer.style.setProperty("--my", `${cy}px`);
      layer.style.setProperty("--glow-r", `${radius}px`);
      layer.style.setProperty("--glow-h", `${hue}`);
      layer.style.setProperty("--dot-r1", `${dotR1}px`);
      layer.style.setProperty("--dot-a1", `${dotA1}`);
      layer.style.setProperty("--dot-r2", `${dotR2}px`);
      layer.style.setProperty("--dot-a2", `${dotA2}`);
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

      // Hue drifts faster with motion, trickles while idle.
      hue = (hue + 0.08 + Math.min(2.5, speed * 0.06)) % 360;

      // Two heartbeats (lub-DUB ... rest) on different periods so the
      // interleaved dot groups drift in and out of phase — separate
      // entities, never a synced blink. Both quicken with cursor speed.
      const bpmScale = 1 + Math.min(0.5, speed * 0.012);
      const heartbeat = (period: number, shift: number) => {
        const phase = (((t * bpmScale) / period + shift) % 1) + 0;
        const lub = Math.exp(-((phase - 0.12) ** 2) / 0.002);
        const dub = 0.55 * Math.exp(-((phase - 0.32) ** 2) / 0.003);
        return lub + dub;
      };
      const b1 = heartbeat(950, 0);
      const b2 = heartbeat(1250, 0.5);
      dotR1 = 1 + b1 * 1.25;
      dotA1 = 0.45 + b1 * 0.45;
      dotR2 = 1 + b2 * 1.25;
      dotA2 = 0.45 + b2 * 0.45;

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

      // Spotlight surfaces (cards, header, footer): local coordinates so
      // their ::after glow clips to their own bounds.
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
