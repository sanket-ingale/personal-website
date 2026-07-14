import { useEffect, useRef, useState } from "react";
import { Check, Moon, Palette, Sun } from "lucide-react";

const PRESETS = [
  { name: "Orange", value: "#f97316" }, // default
  { name: "Cobalt", value: "#2e5bff" },
  { name: "Teal", value: "#14b8a6" },
  { name: "Violet", value: "#7c3aed" },
  { name: "Rose", value: "#f43f5e" },
];

export const DEFAULT_ACCENT = PRESETS[0].value;

export function applyAccent(color: string) {
  document.documentElement.style.setProperty("--accent", color);
}

/**
 * Theme dropdown: light/dark switch (View Transitions ink sweep) plus an
 * accent color picker — presets and a custom swatch. Both persist to
 * localStorage and are re-applied before first paint in main.tsx.
 */
export function ThemeMenu({
  drop = "down",
}: {
  drop?: "down" | "up";
}) {
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(() =>
    document.documentElement.classList.contains("dark")
  );
  const [accent, setAccent] = useState(
    () => localStorage.getItem("accent") ?? DEFAULT_ACCENT
  );
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click / Escape.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const setTheme = (next: boolean, e: React.MouseEvent) => {
    if (next === dark) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const flip = () => {
      document.documentElement.classList.toggle("dark", next);
      setDark(next);
      localStorage.setItem("theme", next ? "dark" : "light");
    };

    if (!document.startViewTransition || reduced) {
      flip();
      return;
    }
    const x = e.clientX || window.innerWidth - 40;
    const y = e.clientY || 40;
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
  };

  const pickAccent = (color: string) => {
    setAccent(color);
    applyAccent(color);
    localStorage.setItem("accent", color);
  };

  return (
    <div className="relative shrink-0" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Theme and accent color"
        aria-expanded={open}
        className={`inline-flex h-9 w-9 items-center justify-center border border-line text-muted transition-colors hover:border-signal hover:text-signal rounded-full`}
      >
        <Palette size={16} />
      </button>

      {open && (
        <div
          className={`absolute right-0 z-30 w-56 rounded-md border border-line bg-panel p-3 shadow-sm ${drop === "up" ? "bottom-11" : "top-11"
            }`}
        >
          <p className="telemetry mb-2">Theme</p>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={(e) => setTheme(false, e)}
              className={`inline-flex items-center justify-center gap-1.5 rounded-md border px-2 py-1.5 font-mono text-xs transition-colors ${!dark ? "border-signal text-signal" : "border-line text-muted hover:border-signal/50"
                }`}
            >
              <Sun size={13} /> Light
            </button>
            <button
              type="button"
              onClick={(e) => setTheme(true, e)}
              className={`inline-flex items-center justify-center gap-1.5 rounded-md border px-2 py-1.5 font-mono text-xs transition-colors ${dark ? "border-signal text-signal" : "border-line text-muted hover:border-signal/50"
                }`}
            >
              <Moon size={13} /> Dark
            </button>
          </div>

          <p className="telemetry mb-2 mt-4">Accent</p>
          <div className="flex items-center gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.value}
                type="button"
                title={p.name}
                aria-label={`${p.name} accent`}
                onClick={() => pickAccent(p.value)}
                className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-line"
                style={{ background: p.value }}
              >
                {accent === p.value && <Check size={12} className="text-white" />}
              </button>
            ))}
            {/* Custom color */}
            <label
              title="Custom"
              className="relative inline-flex h-6 w-6 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-line bg-[conic-gradient(red,yellow,lime,cyan,blue,magenta,red)]"
            >
              <input
                type="color"
                value={accent}
                onChange={(e) => pickAccent(e.target.value)}
                className="absolute inset-0 cursor-pointer opacity-0"
                aria-label="Custom accent color"
              />
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
