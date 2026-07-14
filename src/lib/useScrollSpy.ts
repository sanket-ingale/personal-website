import { useEffect, useRef, useState, type CSSProperties } from "react";

/**
 * Tracks which of the given section ids currently occupies the middle band
 * of the viewport. Returns null when none of them does (e.g. while reading
 * a section that has no quick link).
 */
export function useScrollSpy(ids: readonly string[]) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const els = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => !!el);
    if (!els.length) return;

    const inView = new Set<string>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) inView.add(e.target.id);
          else inView.delete(e.target.id);
        }
        // Deterministic pick: the last id (in nav order) currently in band.
        const current = [...ids].reverse().find((id) => inView.has(id)) ?? null;
        setActive(current);
      },
      // A band around the viewport's middle: a section is "active" while
      // it crosses it.
      { rootMargin: "-40% 0px -50% 0px", threshold: 0 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [ids]);

  return active;
}

/**
 * Sliding highlight pill: measures the active link and returns a style for
 * an absolutely-positioned indicator that glides between links via CSS
 * transitions. Container must be position: relative.
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
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [active]);

  const register = (id: string) => (el: HTMLElement | null) => {
    refs.current[id] = el;
  };

  return { register, style };
}

export const NAV_SECTIONS = ["about", "experience", "work", "skills", "contact"] as const;
