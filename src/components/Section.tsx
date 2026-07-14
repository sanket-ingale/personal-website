import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Section wrapper: SYS/0n eyebrow + scroll-drawn divider + content. */
export function Section({
  id,
  label,
  children,
  className,
}: {
  id: string;
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={cn("scroll-mt-24", className)}>
      <div className="section-divider" />
      <div className="mx-auto max-w-3xl px-7 py-10 sm:px-8 sm:py-20">
        <p className="section-eyebrow telemetry mb-8">{label}</p>
        {children}
      </div>
    </section>
  );
}

/** Mono tech tag, shadcn-badge flavored. */
export function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-sm border border-line bg-panel px-2 py-0.5 font-mono text-xs text-ink/85">
      {children}
    </span>
  );
}
