import { useSyncExternalStore } from "react";

const DEFAULT_ACCENT = "#f97316";

type ThemeState = { dark: boolean; accent: string };

function readState(): ThemeState {
  return {
    dark: document.documentElement.classList.contains("dark"),
    accent: localStorage.getItem("accent") ?? DEFAULT_ACCENT,
  };
}

let state: ThemeState = readState();
const listeners = new Set<() => void>();

function notify() {
  state = readState();
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return state;
}

export function applyAccent(color: string) {
  document.documentElement.style.setProperty("--accent", color);
  localStorage.setItem("accent", color);
  notify();
}

/**
 * Flips the `dark` class, optionally through a View Transitions circular
 * reveal centered on the triggering click.
 */
export function setTheme(next: boolean, e?: { clientX?: number; clientY?: number }) {
  if (next === state.dark) return;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const flip = () => {
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
    notify();
  };

  if (!document.startViewTransition || reduced) {
    flip();
    return;
  }
  const x = e?.clientX || window.innerWidth - 40;
  const y = e?.clientY || 40;
  const r = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y)
  );
  const transition = document.startViewTransition(flip);
  transition.ready.then(() => {
    document.documentElement.animate(
      { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
      {
        duration: 500,
        easing: "cubic-bezier(0.4, 0, 0.2, 1)",
        pseudoElement: "::view-transition-new(root)",
      }
    );
  });
}

/**
 * Shared theme/accent state, backed by the DOM/localStorage as the single
 * source of truth. `Header` and `MobileDock` both keep a `ThemeMenu`
 * mounted at all times (toggled only by CSS breakpoint), so without a
 * shared store the hidden instance's own `useState` would go stale until
 * it remounted — every instance calling this hook re-renders together.
 */
export function useTheme() {
  return useSyncExternalStore(subscribe, getSnapshot);
}
