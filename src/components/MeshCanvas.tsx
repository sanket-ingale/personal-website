import { useEffect, useRef } from "react";
import { MeshSim, type MeshTheme } from "@/mesh/sim";

/**
 * Interactive network-mesh fidget.
 * - Modern path: physics + rendering in a Web Worker via OffscreenCanvas.
 * - Fallback: same sim on the main thread.
 * - prefers-reduced-motion: single static frame, no interaction.
 * Pauses when off-screen or the tab is hidden.
 */
export function MeshCanvas({ className }: { className?: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    // Created imperatively: transferControlToOffscreen() is one-shot per
    // canvas element, so each effect run (StrictMode remounts) needs a
    // fresh node.
    const canvas = document.createElement("canvas");
    canvas.className = "h-full w-full touch-none cursor-grab active:cursor-grabbing";
    wrap.appendChild(canvas);

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const readTheme = (): MeshTheme => {
      const s = getComputedStyle(document.documentElement);
      return {
        line: s.getPropertyValue("--line").trim(),
        node: s.getPropertyValue("--muted").trim(),
        signal: s.getPropertyValue("--signal").trim(),
      };
    };

    const nodeCount = () => (wrap.clientWidth < 480 ? 18 : wrap.clientWidth < 900 ? 28 : 40);

    const canOffscreen =
      !reduced &&
      "transferControlToOffscreen" in canvas &&
      typeof Worker !== "undefined";

    let worker: Worker | null = null;
    let sim: MeshSim | null = null;
    let running = false;
    let raf = 0;
    let cleanupFns: Array<() => void> = [];

    const size = () => ({
      w: wrap.clientWidth,
      h: wrap.clientHeight,
      dpr: Math.min(window.devicePixelRatio || 1, 2),
    });

    // ---- setup: worker path or main-thread path ----
    if (canOffscreen) {
      worker = new Worker(new URL("../mesh/mesh.worker.ts", import.meta.url), {
        type: "module",
      });
      const offscreen = canvas.transferControlToOffscreen();
      worker.postMessage({ type: "init", canvas: offscreen, theme: readTheme() }, [offscreen]);
      const { w, h, dpr } = size();
      worker.postMessage({ type: "resize", w, h, dpr, nodes: nodeCount() });
    } else {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      sim = new MeshSim(ctx);
      sim.theme = readTheme();
      const { w, h, dpr } = size();
      sim.resize(w, h, dpr, nodeCount());
      if (reduced) {
        // Settle a few steps and draw one static frame.
        for (let i = 0; i < 30; i++) sim.step();
        sim.render();
      } else {
        const loop = () => {
          if (!running || !sim) return;
          sim.step();
          sim.render();
          raf = requestAnimationFrame(loop);
        };
        running = true;
        loop();
        cleanupFns.push(() => {
          running = false;
          cancelAnimationFrame(raf);
        });
      }
    }

    const pause = () => {
      if (worker) worker.postMessage({ type: "pause" });
      else if (!reduced && sim) {
        running = false;
        cancelAnimationFrame(raf);
      }
    };
    const resume = () => {
      if (worker) worker.postMessage({ type: "resume" });
      else if (!reduced && sim && !running) {
        running = true;
        const loop = () => {
          if (!running || !sim) return;
          sim.step();
          sim.render();
          raf = requestAnimationFrame(loop);
        };
        loop();
      }
    };

    // ---- shared wiring ----
    const local = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    if (!reduced) {
      const onMove = (e: PointerEvent) => {
        const { x, y } = local(e);
        if (worker) worker.postMessage({ type: "pointer", x, y, active: true });
        else if (sim) {
          sim.pointer.x = x;
          sim.pointer.y = y;
          sim.pointer.active = true;
        }
      };
      const onLeave = () => {
        if (worker) worker.postMessage({ type: "pointer", x: 0, y: 0, active: false });
        else if (sim) sim.pointer.active = false;
      };
      const onDown = (e: PointerEvent) => {
        canvas.setPointerCapture(e.pointerId);
        const { x, y } = local(e);
        if (worker) worker.postMessage({ type: "pointerdown", x, y });
        else sim?.pointerDown(x, y);
      };
      const onUp = () => {
        if (worker) worker.postMessage({ type: "pointerup" });
        else sim?.pointerUp();
      };

      canvas.addEventListener("pointermove", onMove);
      canvas.addEventListener("pointerleave", onLeave);
      canvas.addEventListener("pointerdown", onDown);
      canvas.addEventListener("pointerup", onUp);
      canvas.addEventListener("pointercancel", onUp);
      cleanupFns.push(() => {
        canvas.removeEventListener("pointermove", onMove);
        canvas.removeEventListener("pointerleave", onLeave);
        canvas.removeEventListener("pointerdown", onDown);
        canvas.removeEventListener("pointerup", onUp);
        canvas.removeEventListener("pointercancel", onUp);
      });

      // Pause when off-screen / tab hidden.
      const io = new IntersectionObserver(
        ([entry]) => (entry.isIntersecting ? resume() : pause()),
        { threshold: 0.05 }
      );
      io.observe(wrap);
      const onVis = () => (document.hidden ? pause() : resume());
      document.addEventListener("visibilitychange", onVis);
      cleanupFns.push(() => {
        io.disconnect();
        document.removeEventListener("visibilitychange", onVis);
      });
    }

    // Resize (canvas control is transferred, so size messages go to the sim).
    // Only reseed on width changes — mobile URL-bar show/hide fires
    // height-only resizes that would otherwise reset the mesh mid-scroll.
    let lastW = wrap.clientWidth;
    const ro = new ResizeObserver(() => {
      if (wrap.clientWidth === lastW) return;
      lastW = wrap.clientWidth;
      const { w, h, dpr } = size();
      if (worker) worker.postMessage({ type: "resize", w, h, dpr, nodes: nodeCount() });
      else if (sim) {
        sim.resize(w, h, dpr, nodeCount());
        if (reduced) {
          for (let i = 0; i < 30; i++) sim.step();
          sim.render();
        }
      }
    });
    ro.observe(wrap);
    cleanupFns.push(() => ro.disconnect());

    // Re-read colors when the theme class flips.
    const mo = new MutationObserver(() => {
      const theme = readTheme();
      if (worker) worker.postMessage({ type: "theme", theme });
      else if (sim) {
        sim.theme = theme;
        if (reduced) sim.render();
      }
    });
    mo.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "style"],
    });
    cleanupFns.push(() => mo.disconnect());

    return () => {
      cleanupFns.forEach((fn) => fn());
      worker?.terminate();
      canvas.remove();
    };
  }, []);

  return <div ref={wrapRef} className={className} aria-hidden="true" />;
}
