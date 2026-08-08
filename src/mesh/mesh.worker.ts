/// <reference lib="webworker" />
/**
 * Mesh worker — receives an OffscreenCanvas via transferControlToOffscreen()
 * and runs physics + rendering entirely off the main thread.
 */
import { MeshSim, type MeshTheme } from "./sim";

let sim: MeshSim | null = null;
let running = false;
// Tagged by how the id was produced, so cancellation can never desync from
// hasRAF even if a future edit decouples the two checks.
let rafId: { kind: "raf"; id: number } | { kind: "timeout"; id: ReturnType<typeof setTimeout> } | null =
  null;

const hasRAF = typeof requestAnimationFrame === "function";

function loop() {
  if (!sim || !running) return;
  sim.step();
  sim.render();
  rafId = hasRAF
    ? { kind: "raf", id: requestAnimationFrame(loop) }
    : { kind: "timeout", id: setTimeout(loop, 16) };
}

function start() {
  if (running) return;
  running = true;
  loop();
}

function stop() {
  running = false;
  if (rafId?.kind === "raf") cancelAnimationFrame(rafId.id);
  else if (rafId?.kind === "timeout") clearTimeout(rafId.id);
  rafId = null;
}

type Msg =
  | { type: "init"; canvas: OffscreenCanvas; theme: MeshTheme }
  | { type: "resize"; w: number; h: number; dpr: number; nodes: number }
  | { type: "theme"; theme: MeshTheme }
  | { type: "pointer"; x: number; y: number; active: boolean }
  | { type: "pointerdown"; x: number; y: number }
  | { type: "pointerup" }
  | { type: "pause" }
  | { type: "resume" };

self.onmessage = (ev: MessageEvent<Msg>) => {
  const msg = ev.data;
  switch (msg.type) {
    case "init": {
      const ctx = msg.canvas.getContext("2d");
      if (!ctx) return;
      sim = new MeshSim(ctx);
      sim.theme = msg.theme;
      break;
    }
    case "resize":
      sim?.resize(msg.w, msg.h, msg.dpr, msg.nodes);
      start();
      break;
    case "theme":
      if (sim) sim.theme = msg.theme;
      break;
    case "pointer":
      if (sim) {
        sim.pointer.x = msg.x;
        sim.pointer.y = msg.y;
        sim.pointer.active = msg.active;
      }
      break;
    case "pointerdown":
      sim?.pointerDown(msg.x, msg.y);
      break;
    case "pointerup":
      sim?.pointerUp();
      break;
    case "pause":
      stop();
      break;
    case "resume":
      start();
      break;
  }
};
