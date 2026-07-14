# Sanket Ingale — Portfolio

Personal website built with Vite + React + TypeScript, Tailwind CSS v4, and shadcn-style components.

## Run

```bash
npm install
npm run dev      # local dev server
npm run build    # production build → dist/
npm run preview  # serve the production build
```

## Editing content

All copy lives in `src/data/content.ts` — profile, projects, experience, skills, education. Edit that one file to update the site; no component changes needed.

## Notable implementation details

- **Hero mesh fidget** (`src/mesh/`, `src/components/MeshCanvas.tsx`): Verlet-integration spring physics rendered to canvas. On supporting browsers the sim runs in a **Web Worker via OffscreenCanvas**, keeping the main thread free; otherwise it falls back to a main-thread loop. Nodes are grabbable (Pointer Events), the cursor exerts a gentle repulsion field, and the sim pauses when off-screen or the tab is hidden. `prefers-reduced-motion` renders a single static frame.
- **Theme sweep** (`src/components/ThemeToggle.tsx`): dark-mode toggle animated with the **View Transitions API** — the new theme expands as a circle from the button. Degrades to an instant swap.
- **Scroll-driven reveals** (`src/index.css`): section dividers draw in and eyebrows fade in using **CSS `animation-timeline: view()`** — zero JavaScript, no-ops where unsupported.
- **Pointer lens** (`src/components/CursorGlow.tsx`): a ~120px hue-cycling tint follows the cursor and reveals a blueprint dot-grid beneath it — rAF-throttled CSS-variable writes, zero React re-renders. On touch devices the lens follows the finger and fades on lift; a quick tap emits a pulse ring. Hue cycling and pulses are disabled under `prefers-reduced-motion`.
- **Footer signal trace** (`src/components/Footer.tsx`): a waveform that draws in on scroll (CSS view() timeline) plus live IST local time next to the copyright.
- Dark mode follows system preference on load; tokens are CSS variables consumed by Tailwind v4 `@theme`.
