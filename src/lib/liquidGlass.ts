import { useEffect, useRef } from "react";

/**
 * Real liquid-glass refraction, ported from our displacement-map glass box:
 * a rounded-rect signed-distance-field is rendered to a canvas, encoded as
 * a normal map (R = x-shift, G = y-shift), and fed to an SVG
 * feDisplacementMap referenced via `backdrop-filter: url(#...)` — the
 * backdrop genuinely bends at the element's edges.
 *
 * Lessons kept from that build: fade band = 30% of the smaller dimension
 * and modest scale, so displacement never exceeds the band (the fold
 * artifact); smoothstep falloff so the refraction hugs the rim.
 *
 * SVG-filter backdrops are Chromium-only; elsewhere this attaches nothing
 * and the CSS blur/saturate fallback carries the look.
 */

const SVG_NS = "http://www.w3.org/2000/svg";

function sdRoundedRect(x: number, y: number, w: number, h: number, r: number) {
  const qx = Math.abs(x - w / 2) - (w / 2 - r);
  const qy = Math.abs(y - h / 2) - (h / 2 - r);
  const ox = Math.max(qx, 0);
  const oy = Math.max(qy, 0);
  return Math.hypot(ox, oy) + Math.min(Math.max(qx, qy), 0) - r;
}

function attachLiquidGlass(el: HTMLElement, radiusArg?: number, blur = 2): () => void {
  // Feature gate: only Chromium applies url() filters in backdrop-filter.
  const chromium = "chrome" in window;
  if (!chromium) return () => {};

  const id = `lg-${Math.random().toString(36).slice(2)}`;
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("width", "0");
  svg.setAttribute("height", "0");
  svg.style.position = "absolute";
  svg.setAttribute("aria-hidden", "true");

  const filter = document.createElementNS(SVG_NS, "filter");
  filter.setAttribute("id", id);
  filter.setAttribute("filterUnits", "userSpaceOnUse");
  filter.setAttribute("color-interpolation-filters", "sRGB");

  const feImage = document.createElementNS(SVG_NS, "feImage");
  feImage.setAttribute("result", "map");
  const feDisp = document.createElementNS(SVG_NS, "feDisplacementMap");
  feDisp.setAttribute("in", "SourceGraphic");
  feDisp.setAttribute("in2", "map");
  feDisp.setAttribute("xChannelSelector", "R");
  feDisp.setAttribute("yChannelSelector", "G");

  filter.appendChild(feImage);
  filter.appendChild(feDisp);
  svg.appendChild(filter);
  document.body.appendChild(svg);

  const render = () => {
    const w = Math.max(2, Math.round(el.offsetWidth));
    const h = Math.max(2, Math.round(el.offsetHeight));
    const r = Math.min(radiusArg ?? h / 2, h / 2, w / 2);
    const fade = 0.3 * Math.min(w, h); // the anti-fold band
    const scale = Math.min(18, fade * 0.9); // displacement stays inside it

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d")!;
    const img = ctx.createImageData(w, h);
    const data = img.data;

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const d = sdRoundedRect(x + 0.5, y + 0.5, w, h, r);
        let nx = 0;
        let ny = 0;
        let fall = 0;
        if (d < 0) {
          const depth = -d; // distance inside from the boundary
          if (depth < fade) {
            let t = 1 - depth / fade;
            t = t * t * (3 - 2 * t); // smoothstep: refraction hugs the rim
            fall = t;
            // Outward normal via central differences on the SDF.
            const e = 1;
            nx = sdRoundedRect(x + 0.5 + e, y + 0.5, w, h, r) - sdRoundedRect(x + 0.5 - e, y + 0.5, w, h, r);
            ny = sdRoundedRect(x + 0.5, y + 0.5 + e, w, h, r) - sdRoundedRect(x + 0.5, y + 0.5 - e, w, h, r);
            const len = Math.hypot(nx, ny) || 1;
            nx /= len;
            ny /= len;
          }
        }
        const i = (y * w + x) * 4;
        data[i] = 128 + nx * fall * 127;
        data[i + 1] = 128 + ny * fall * 127;
        data[i + 2] = 128;
        data[i + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);

    filter.setAttribute("x", "0");
    filter.setAttribute("y", "0");
    filter.setAttribute("width", `${w}`);
    filter.setAttribute("height", `${h}`);
    feImage.setAttribute("href", canvas.toDataURL());
    feImage.setAttribute("width", `${w}`);
    feImage.setAttribute("height", `${h}`);
    feDisp.setAttribute("scale", `${scale}`);

    el.style.backdropFilter = `url(#${id}) blur(${blur}px) saturate(1.8)`;
  };

  render();

  // Re-render the map when the element resizes (debounced a touch).
  let timer: ReturnType<typeof setTimeout>;
  const ro = new ResizeObserver(() => {
    clearTimeout(timer);
    timer = setTimeout(render, 120);
  });
  ro.observe(el);

  return () => {
    ro.disconnect();
    clearTimeout(timer);
    el.style.backdropFilter = "";
    svg.remove();
  };
}

/** Hook: attach refraction to an element. radius defaults to height/2 (pill). */
export function useLiquidGlass<T extends HTMLElement>(radius?: number, blur = 2) {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (!ref.current) return;
    return attachLiquidGlass(ref.current, radius, blur);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return ref;
}
