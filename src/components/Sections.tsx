import { education, experience, profile, projects, skills } from "@/data/content";
import { ArrowUpRight, ChevronDown } from "lucide-react";
import { Section, Tag } from "@/components/Section";
import { LocalTime } from "@/components/Footer";
import { TicTacToe } from "@/components/TicTacToe";

export function About() {
  return (
    <Section id="about" label="ABOUT">
      <div className="space-y-4 text-[0.95rem] leading-relaxed text-ink sm:text-base">
        {profile.about.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
    </Section>
  );
}

export function Work() {
  return (
    <Section id="work" label="WORK">
      <div className="space-y-5">
        {projects.map((p) => (
          <article
            key={p.id}
            data-spotlight
            className="group rounded-md border border-line bg-panel p-5 transition-colors hover:border-signal sm:p-6"
          >
            <h3 className="font-display text-lg font-medium tracking-tight transition-colors group-hover:text-signal sm:text-xl">
              {p.name}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-muted sm:text-[0.95rem]">
              {p.summary}
            </p>
            {/* Desktop: always expanded */}
            <ul className="mt-4 hidden space-y-2 sm:block">
              {p.highlights.map((h, i) => (
                <li
                  key={i}
                  className="border-l border-line pl-3 text-sm leading-relaxed text-ink transition-colors group-hover:border-signal/40"
                >
                  {h}
                </li>
              ))}
            </ul>
            {/* Mobile: tap to expand */}
            <details className="group/details mt-3 sm:hidden">
              <summary className="telemetry flex cursor-pointer list-none items-center gap-1.5 [&::-webkit-details-marker]:hidden">
                Details
                <ChevronDown
                  size={12}
                  className="transition-transform group-open/details:rotate-180"
                />
              </summary>
              <ul className="mt-3 space-y-2">
                {p.highlights.map((h, i) => (
                  <li
                    key={i}
                    className="border-l border-line pl-3 text-sm leading-relaxed text-ink"
                  >
                    {h}
                  </li>
                ))}
              </ul>
            </details>
            <div className="mt-5 flex flex-wrap gap-1.5">
              {p.tech.map((t) => (
                <Tag key={t}>{t}</Tag>
              ))}
            </div>
          </article>
        ))}
      </div>
    </Section>
  );
}

export function Experience() {
  return (
    <Section id="experience" label="EXPERIENCE">
      <ol className="space-y-10">
        {experience.map((r) => (
          <li key={r.company} className="grid gap-2 sm:grid-cols-[10rem_1fr] sm:gap-6">
            <div className="telemetry pt-1">{r.period}</div>
            <div>
              <h3 className="font-display text-base font-medium tracking-tight">
                {r.title} · {r.company}
              </h3>
              <ul className="mt-2 space-y-1.5">
                {r.points.map((pt, i) => (
                  <li key={i} className="text-sm leading-relaxed text-muted">
                    {pt}
                  </li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ol>
    </Section>
  );
}

export function Education() {
  return (
    <Section id="education" label="EDUCATION">
      <div className="grid gap-2 sm:grid-cols-[10rem_1fr] sm:gap-6">
        <div className="telemetry pt-1">{education.period}</div>
        <div>
          <h3 className="font-display text-base font-medium tracking-tight">
            {education.degree}
          </h3>
          <p className="mt-1 text-sm text-muted">{education.school}</p>
        </div>
      </div>
    </Section>
  );
}

export function Skills() {
  return (
    <Section id="skills" label="SKILLS">
      <div className="space-y-6">
        {skills.map((g) => (
          <div key={g.group} className="grid gap-2 sm:grid-cols-[10rem_1fr] sm:gap-6">
            <div className="telemetry pt-1">{g.group}</div>
            <div className="flex flex-wrap gap-1.5">
              {g.items.map((s) => (
                <Tag key={s}>{s}</Tag>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

export function Contact() {
  return (
    <Section id="contact" label="CONTACT">
      <div className="grid gap-8 sm:grid-cols-[1fr_auto] sm:gap-10">
        <div className="order-1 flex flex-col justify-between gap-6">
          <div>
            <h2 className="font-display text-3xl font-medium tracking-tight sm:text-4xl">
              Let's build something.
            </h2>
            <p className="mt-4 max-w-md text-muted">
              Happy to chat about new roles or interesting projects.
            </p>
          </div>
          <div>
            <a
              href={`mailto:${profile.email}`}
              className="inline-flex items-center gap-2 rounded-md border border-line bg-panel px-4 py-2.5 font-mono text-sm transition-colors hover:border-signal hover:text-signal"
            >
              {profile.email}
            </a>
            <div className="mt-5 flex items-center gap-8">
              {profile.links.map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  target="_blank"
                  rel="noreferrer"
                  className="telemetry inline-flex items-center gap-0.5 transition-colors hover:!text-signal"
                >
                  {l.label}
                  <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className="order-2 border-t sm:border-none border-line pt-6 sm:pt-0">
          <TicTacToe />
        </div>
        <footer className="order-3 border-t border-line pt-6 sm:col-span-2 sm:pt-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="telemetry">
              © {new Date().getFullYear()} {profile.name}
            </span>
            <LocalTime inFooter />
          </div>
        </footer>
      </div>
    </Section>
  );
}
