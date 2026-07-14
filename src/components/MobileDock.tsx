import { smoothScrollTo } from "@/components/Hero";
import { ThemeMenu } from "@/components/ThemeMenu";
import { useLiquidGlass } from "@/lib/liquidGlass";
import { NAV_SECTIONS, useScrollSpy, useSlidingIndicator } from "@/lib/useScrollSpy";

/**
 * Mobile-only floating dock: navigation where thumbs live, instead of a
 * shrunk desktop top-nav. Hidden from sm: upward.
 */
export function MobileDock() {
  const glassRef = useLiquidGlass<HTMLDivElement>(undefined, 10);
  const active = useScrollSpy(NAV_SECTIONS);
  const { register, style } = useSlidingIndicator(active);
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-[max(1.75rem,env(safe-area-inset-bottom))] z-30 flex justify-center sm:hidden"
    >
      <div
        ref={glassRef}
        className="max-w-[85%] liquid-glass liquid-glass--strong flex items-center gap-1 rounded-full py-1.5 pl-2 pr-1.5"
      >
        {/* Tabs scroll inside this clip; the theme button sits outside it. */}
        <div className="dock-fade relative flex items-center gap-1 overflow-x-auto [scrollbar-width:none]">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute rounded-full bg-signal/15 transition-all duration-300 ease-out motion-reduce:transition-none"
            style={style}
          />
          {NAV_SECTIONS.map((id) => (
            <a
              key={id}
              ref={register(id)}
              href={`#${id}`}
              onClick={smoothScrollTo}
              aria-current={active === id ? "true" : undefined}
              className={`telemetry relative z-10 rounded-full px-3 py-2 font-medium capitalize transition-colors ${active === id ? "!text-signal" : "!text-ink"
                }`}
            >
              {id}
            </a>
          ))}
        </div>
        {/* <span aria-hidden="true" className="h-5 w-px shrink-0 bg-line" /> */}
        <ThemeMenu drop="up" pill />
      </div>
    </nav>
  );
}
