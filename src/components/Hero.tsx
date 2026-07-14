import { profile } from "@/data/content";
import { LocalTime } from "@/components/Footer";
import { NAV_SECTIONS, useScrollSpy, useSlidingIndicator } from "@/lib/useScrollSpy";

export function smoothScrollTo(e: React.MouseEvent<HTMLAnchorElement>) {
  const hash = e.currentTarget.getAttribute("href");
  if (!hash?.startsWith("#")) return;
  const target = document.querySelector(hash);
  if (!target) return;
  e.preventDefault();
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  target.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
  history.pushState(null, "", hash);
}
import { MeshCanvas } from "@/components/MeshCanvas";
import { ThemeMenu } from "@/components/ThemeMenu";

export function Header() {
  const active = useScrollSpy(NAV_SECTIONS);
  const { register, style } = useSlidingIndicator(active);
  return (
    <header
      className="liquid-glass liquid-glass--bar sticky top-0 z-20"
    >
      <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-7 sm:px-8">
        <a href="#top" onClick={smoothScrollTo} className="flex items-center gap-2">
          <span className="status-dot status-dot--pulse" />
          <span className="telemetry !text-ink">sanketingale.in</span>
        </a>
        <span className="sm:hidden">
          <LocalTime />
        </span>
        <nav className="relative hidden items-center gap-1 sm:flex" aria-label="Primary">
          {/* Sliding highlight: glides between links as sections scroll by */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute rounded-full bg-signal/10 transition-all duration-300 ease-out motion-reduce:transition-none"
            style={style}
          />
          {NAV_SECTIONS.map((id) => (
            <a
              key={id}
              ref={register(id)}
              href={`#${id}`}
              onClick={smoothScrollTo}
              aria-current={active === id ? "true" : undefined}
              className={`telemetry relative z-10 rounded-full px-3 py-1.5 capitalize transition-colors hover:text-signal ${active === id ? "!text-signal" : ""
                }`}
            >
              {id}
            </a>
          ))}
          <ThemeMenu />
        </nav>
      </div>
      <div className="scroll-progress sm:hidden" aria-hidden="true" />
    </header>
  );
}

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden">
      {/* The fidget: grab a node and fling it. On mobile it lives in a clear
          band above the text instead of hiding behind it. */}
      <MeshCanvas className="absolute inset-x-0 top-0 bottom-[35%] opacity-70 sm:bottom-0 sm:opacity-100" />
      {/* Readability scrim: fades the mesh behind the text. Vertical on
          mobile (text at the bottom), left-to-right from sm: up. */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-surface via-surface/70 to-transparent sm:bg-gradient-to-r" />
      <div className="pointer-events-none relative mx-auto w-full max-w-3xl px-7 pb-16 pt-44 sm:px-8 sm:pb-32 sm:pt-28">
        <h1 className="font-display text-[13vw] font-medium leading-[0.95] tracking-tight sm:text-7xl">
          Sanket
          <br />
          Ingale
        </h1>
        <p className="mt-6 max-w-md text-base text-muted sm:text-lg">
          {profile.tagline}
        </p>
        <div className="pointer-events-auto mt-8 flex flex-wrap items-center gap-x-5 gap-y-2">
          {profile.links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              target="_blank"
              rel="noreferrer"
              className="telemetry !text-ink underline decoration-line underline-offset-4 transition-colors hover:!text-signal hover:decoration-signal"
            >
              {l.label}
            </a>
          ))}
          <a
            href={`mailto:${profile.email}`}
            className="telemetry !text-ink underline decoration-line underline-offset-4 transition-colors hover:!text-signal hover:decoration-signal"
          >
            Email
          </a>
        </div>
      </div>
    </section>
  );
}
