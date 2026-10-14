import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from "react";

export const NAV_SECTIONS = ["about", "experience", "work", "skills", "contact"] as const;

/**
 * Tracks which of NAV_SECTIONS currently occupies the middle band of the
 * viewport, via a single shared IntersectionObserver. `Header` and
 * `MobileDock` both keep a nav mounted at all times (toggled only by CSS
 * breakpoint) and both watch the exact same sections, so this is a module-
 * level store rather than a per-component observer: one IntersectionObserver
 * for the whole app instead of two doing identical work.
 */
let active: string | null = null;
const listeners = new Set<() => void>();
let observer: IntersectionObserver | null = null;

function ensureObserver() {
  if (observer) return;
  const els = NAV_SECTIONS.map((id) => document.getElementById(id)).filter(
    (el): el is HTMLElement => !!el
  );
  if (!els.length) return;

  const inView = new Set<string>();
  observer = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) inView.add(e.target.id);
        else inView.delete(e.target.id);
      }
      // Deterministic pick: the last id (in nav order) currently in band.
      const current = [...NAV_SECTIONS].reverse().find((id) => inView.has(id)) ?? null;
      if (current !== active) {
        active = current;
        listeners.forEach((listener) => listener());
      }
    },
    // A band around the viewport's middle: a section is "active" while
    // it crosses it.
    { rootMargin: "-40% 0px -50% 0px", threshold: 0 }
  );
  els.forEach((el) => observer!.observe(el));
}

function subscribe(listener: () => void) {
  ensureObserver();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && observer) {
      observer.disconnect();
      observer = null;
    }
  };
}

function getSnapshot() {
  return active;
}

export function useScrollSpy() {
  return useSyncExternalStore(subscribe, getSnapshot);
}

/**
 * Sliding highlight pill: measures the active link and returns a style for
 * an absolutely-positioned indicator that glides between links via CSS
 * transitions. Container must be position: relative. Unlike useScrollSpy,
 * this stays per-instance, since Header and MobileDock render distinct DOM nodes
 * for their nav links, so each needs its own measurements.
 */
export function useSlidingIndicator(active: string | null) {
  const refs = useRef<Record<string, HTMLElement | null>>({});
  const [style, setStyle] = useState<CSSProperties>({ opacity: 0 });

  useEffect(() => {
    const measure = () => {
      const el = active ? refs.current[active] : null;
      if (!el) {
        setStyle((s) => ({ ...s, opacity: 0 }));
        return;
      }
      setStyle({
        left: el.offsetLeft,
        top: el.offsetTop,
        width: el.offsetWidth,
        height: el.offsetHeight,
        opacity: 1,
      });
      // When the nav itself overflows (mobile dock), keep the active link
      // visible by centering it in the scrollable container.
      const container = el.offsetParent as HTMLElement | null;
      if (container && container.scrollWidth > container.clientWidth) {
        container.scrollTo({
          left: el.offsetLeft - (container.clientWidth - el.offsetWidth) / 2,
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
            ? "auto"
            : "smooth",
        });
      }
    };
    measure();

    let raf = 0;
    const onResize = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(measure);
    };
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, [active]);

  const register = useCallback(
    (id: string) => (el: HTMLElement | null) => {
      refs.current[id] = el;
    },
    []
  );

  return { register, style };
}
