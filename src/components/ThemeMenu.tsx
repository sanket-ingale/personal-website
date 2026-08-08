import { useEffect, useRef, useState } from "react";
import { Check, Moon, Palette, Sun } from "lucide-react";
import { applyAccent, setTheme as setThemeShared, useTheme } from "@/lib/useTheme";

const PRESETS = [
  { name: "Orange", value: "#f97316" }, // default
  { name: "Cobalt", value: "#2e5bff" },
  { name: "Teal", value: "#14b8a6" },
  { name: "Violet", value: "#7c3aed" },
  { name: "Rose", value: "#f43f5e" },
];

/**
 * Theme dropdown: light/dark switch (View Transitions ink sweep) plus an
 * accent color picker — presets and a custom swatch. Both persist to
 * localStorage and are re-applied before first paint in main.tsx. State
 * comes from the shared `useTheme` store (src/lib/useTheme.ts) since both
 * the header and mobile dock keep their own `ThemeMenu` instance mounted
 * at once — a shared store keeps whichever one is hidden from going stale.
 */
export function ThemeMenu({
  drop = "down",
}: {
  drop?: "down" | "up";
}) {
  const [open, setOpen] = useState(false);
  const { dark, accent } = useTheme();
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
              onClick={(e) => setThemeShared(false, e)}
              className={`inline-flex items-center justify-center gap-1.5 rounded-md border px-2 py-1.5 font-mono text-xs transition-colors ${!dark ? "border-signal text-signal" : "border-line text-muted hover:border-signal/50"
                }`}
            >
              <Sun size={13} /> Light
            </button>
            <button
              type="button"
              onClick={(e) => setThemeShared(true, e)}
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
                onClick={() => applyAccent(p.value)}
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
                onChange={(e) => applyAccent(e.target.value)}
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
