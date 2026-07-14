/**
 * Network mesh fidget — Verlet integration spring physics.
 * Pure module: no DOM assumptions beyond a 2D canvas context,
 * so it runs identically inside a Web Worker (OffscreenCanvas)
 * or on the main thread as a fallback.
 */

export type MeshTheme = {
  line: string;
  node: string;
  signal: string;
};

type Node = {
  x: number;
  y: number;
  px: number; // previous position (Verlet)
  py: number;
  hx: number; // home anchor
  hy: number;
  r: number;
  dist: number; // path distance from the signal node (node 0), for the pulse
};

type Edge = { a: number; b: number; rest: number };

export type PointerState = {
  x: number;
  y: number;
  active: boolean; // pointer is over the canvas
  down: boolean;
};

const DAMPING = 0.985;
const SPRING = 0.02;
const HOME_PULL = 0.004;
const REPEL_RADIUS = 110;
const REPEL_FORCE = 0.55;

export class MeshSim {
  private nodes: Node[] = [];
  private edges: Edge[] = [];
  private w = 0;
  private h = 0;
  private dpr = 1;
  private grabbed = -1;
  private t = 0;

  pointer: PointerState = { x: 0, y: 0, active: false, down: false };
  theme: MeshTheme = { line: "#e2e5ea", node: "#5c6470", signal: "#2e5bff" };

  private ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;

  constructor(ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  resize(w: number, h: number, dpr: number, nodeCount: number) {
    this.w = w;
    this.h = h;
    this.dpr = dpr;
    const canvas = this.ctx.canvas;
    canvas.width = Math.max(1, Math.round(w * dpr));
    canvas.height = Math.max(1, Math.round(h * dpr));
    this.seed(nodeCount);
  }

  private seed(count: number) {
    // Deterministic-ish scatter: golden-angle spiral around center-right,
    // jittered so it reads organic rather than geometric.
    this.nodes = [];
    const cx = this.w * 0.58; // biased right of center
    const cy = this.h * 0.5;
    const maxR = Math.min(this.w, this.h) * 0.42;
    for (let i = 0; i < count; i++) {
      const ang = i * 2.39996;
      const r = maxR * Math.sqrt((i + 0.6) / count);
      const jx = Math.sin(i * 12.9898) * 14;
      const jy = Math.cos(i * 78.233) * 14;
      const x = cx + Math.cos(ang) * r + jx;
      const y = cy + Math.sin(ang) * r + jy;
      this.nodes.push({
        x,
        y,
        px: x,
        py: y,
        hx: x,
        hy: y,
        r: i === 0 ? 4.5 : 2 + ((i * 7919) % 3) * 0.75,
        dist: Infinity,
      });
    }
    // Edges: connect each node to its 2 nearest neighbours, dedup.
    const seen = new Set<string>();
    this.edges = [];
    for (let i = 0; i < this.nodes.length; i++) {
      const dists = this.nodes
        .map((n, j) => ({ j, d: (n.hx - this.nodes[i].hx) ** 2 + (n.hy - this.nodes[i].hy) ** 2 }))
        .filter((e) => e.j !== i)
        .sort((a, b) => a.d - b.d)
        .slice(0, 3); // 3 nearest neighbours — denser, more complex web
      for (const { j, d } of dists) {
        const key = i < j ? `${i}-${j}` : `${j}-${i}`;
        if (seen.has(key)) continue;
        seen.add(key);
        this.edges.push({ a: i, b: j, rest: Math.sqrt(d) });
      }
    }

    // Dijkstra from the signal node: each node's path distance drives the
    // heartbeat pulse travelling through the mesh.
    const adj: Array<Array<{ j: number; w: number }>> = this.nodes.map(() => []);
    for (const e of this.edges) {
      adj[e.a].push({ j: e.b, w: e.rest });
      adj[e.b].push({ j: e.a, w: e.rest });
    }
    this.nodes[0].dist = 0;
    const visited = new Array(this.nodes.length).fill(false);
    for (;;) {
      let u = -1;
      let best = Infinity;
      for (let i = 0; i < this.nodes.length; i++) {
        if (!visited[i] && this.nodes[i].dist < best) {
          best = this.nodes[i].dist;
          u = i;
        }
      }
      if (u === -1) break;
      visited[u] = true;
      for (const { j, w } of adj[u]) {
        if (this.nodes[u].dist + w < this.nodes[j].dist) {
          this.nodes[j].dist = this.nodes[u].dist + w;
        }
      }
    }
    this.maxDist = Math.max(
      ...this.nodes.map((n) => (Number.isFinite(n.dist) ? n.dist : 0))
    );
  }

  private maxDist = 0;

  pointerDown(x: number, y: number) {
    this.pointer.down = true;
    this.pointer.x = x;
    this.pointer.y = y;
    // Grab nearest node within reach.
    let best = -1;
    let bestD = 40 ** 2;
    this.nodes.forEach((n, i) => {
      const d = (n.x - x) ** 2 + (n.y - y) ** 2;
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    });
    this.grabbed = best;
  }

  pointerUp() {
    this.pointer.down = false;
    this.grabbed = -1;
  }

  step() {
    this.t += 1;
    const { nodes, edges, pointer } = this;

    // Verlet integrate + home pull + idle drift.
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      if (i === this.grabbed && pointer.down) {
        // Grabbed node follows the pointer with a little lag.
        n.x += (pointer.x - n.x) * 0.4;
        n.y += (pointer.y - n.y) * 0.4;
        n.px = n.x;
        n.py = n.y;
        continue;
      }
      const vx = (n.x - n.px) * DAMPING;
      const vy = (n.y - n.py) * DAMPING;
      n.px = n.x;
      n.py = n.y;
      n.x += vx + (n.hx - n.x) * HOME_PULL + Math.sin(this.t * 0.004 + i * 1.7) * 0.02;
      n.y += vy + (n.hy - n.y) * HOME_PULL + Math.cos(this.t * 0.005 + i * 2.3) * 0.02;

      // Pointer repulsion field (hover, not just drag).
      if (pointer.active && !pointer.down) {
        const dx = n.x - pointer.x;
        const dy = n.y - pointer.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < REPEL_RADIUS * REPEL_RADIUS && d2 > 0.01) {
          const d = Math.sqrt(d2);
          const f = ((REPEL_RADIUS - d) / REPEL_RADIUS) * REPEL_FORCE;
          n.x += (dx / d) * f;
          n.y += (dy / d) * f;
        }
      }
    }

    // Spring constraints along edges.
    for (const e of edges) {
      const a = nodes[e.a];
      const b = nodes[e.b];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const d = Math.sqrt(dx * dx + dy * dy) || 0.001;
      const diff = ((d - e.rest) / d) * SPRING;
      const ox = dx * diff;
      const oy = dy * diff;
      if (e.a !== this.grabbed) {
        a.x += ox;
        a.y += oy;
      }
      if (e.b !== this.grabbed) {
        b.x -= ox;
        b.y -= oy;
      }
    }
  }

  render() {
    const ctx = this.ctx;
    const { dpr, w, h, nodes, edges, theme } = this;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    ctx.lineWidth = 1;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = theme.line;
    ctx.beginPath();
    for (const e of edges) {
      ctx.moveTo(nodes[e.a].x, nodes[e.a].y);
      ctx.lineTo(nodes[e.b].x, nodes[e.b].y);
    }
    ctx.stroke();

    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      if (i === 0) {
        // Signal node: cobalt with a breathing halo.
        const halo = 6 + Math.sin(this.t * 0.05) * 2.5;
        ctx.fillStyle = theme.signal;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r + halo, 0, Math.PI * 2);
        ctx.strokeStyle = theme.signal;
        ctx.globalAlpha = 0.35;
        ctx.stroke();
        ctx.globalAlpha = 1;
        ctx.strokeStyle = theme.line;
      } else {
        ctx.fillStyle = theme.node;
        ctx.fill();
      }
    }

    this.renderPulse();
  }

  /**
   * Heartbeat pulse: a wavefront leaves the signal node and travels the
   * mesh along its edges — packets run the wires, nodes flash as it
   * arrives. Two fronts per cycle (lub-DUB), then a rest.
   */
  private renderPulse() {
    const cycle = this.maxDist + 140; // travel + a short rest between beats
    const f1 = (this.t * 1.1) % cycle;
    this.renderFront(f1, 1);
    const f2 = f1 - 70; // the softer second beat trailing the first
    if (f2 > 0) this.renderFront(f2, 0.5);
  }

  private renderFront(front: number, strength: number) {
    const ctx = this.ctx;
    const { nodes, edges, theme } = this;
    if (front > this.maxDist + 40) return;

    // Packets travelling the edges the wavefront is currently crossing.
    for (const e of edges) {
      const da = nodes[e.a].dist;
      const db = nodes[e.b].dist;
      if (!Number.isFinite(da) || !Number.isFinite(db) || da === db) continue;
      const tt = (front - da) / (db - da);
      if (tt < 0 || tt > 1) continue;
      const a = nodes[e.a];
      const b = nodes[e.b];
      const px = a.x + (b.x - a.x) * tt;
      const py = a.y + (b.y - a.y) * tt;
      // Light the wire faintly...
      ctx.globalAlpha = 0.35 * strength;
      ctx.strokeStyle = theme.signal;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
      // ...and draw the packet riding it.
      ctx.globalAlpha = 0.9 * strength;
      ctx.fillStyle = theme.signal;
      ctx.beginPath();
      ctx.arc(px, py, 2.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    // Nodes flash as the front arrives.
    for (const n of nodes) {
      if (!Number.isFinite(n.dist)) continue;
      const g = Math.exp(-((n.dist - front) ** 2) / 300) * strength;
      if (g < 0.03) continue;
      ctx.globalAlpha = g * 0.9;
      ctx.fillStyle = theme.signal;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r + g * 1.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = g * 0.3;
      ctx.strokeStyle = theme.signal;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r + 4 + g * 5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
  }

  /** Single static frame for prefers-reduced-motion. */
  renderStatic() {
    this.step();
    this.render();
  }
}
