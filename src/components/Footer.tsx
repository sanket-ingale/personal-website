import { useEffect, useState } from "react";
import { profile } from "@/data/content";

/**
 * Signal trace: a latency-sparkline waveform that draws itself
 * left-to-right as the footer enters the viewport (CSS view() timeline,
 * static where unsupported), ending in the pulsing status dot.
 */
export function SignalTrace() {
  return (
    <div className="flex items-center gap-3" aria-hidden="true">
      <svg
        viewBox="0 0 600 24"
        preserveAspectRatio="none"
        className="h-6 w-full"
        fill="none"
      >
        {/* Rounded waveform: smooth cubic bumps, no corners */}
        <path
          className="footer-trace-base"
          d="M0 12 H80 c6 0 6 -9 12 -9 c6 0 6 9 12 9 H210 c5 0 5 5 10 5 c5 0 5 -5 10 -5 H330 c7 0 7 -11 14 -11 c7 0 7 11 14 11 H470 c5 0 5 6 10 6 c5 0 5 -6 10 -6 H600"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength={1}
        />
        {/* Signal pulse travelling the same path, loops forever */}
        <path
          className="footer-trace-pulse"
          d="M0 12 H80 c6 0 6 -9 12 -9 c6 0 6 9 12 9 H210 c5 0 5 5 10 5 c5 0 5 -5 10 -5 H330 c7 0 7 -11 14 -11 c7 0 7 11 14 11 H470 c5 0 5 6 10 6 c5 0 5 -6 10 -6 H600"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength={1}
        />
      </svg>
      <span className="status-dot status-dot--pulse" />
    </div>
  );
}

/** Live local time — tells visitors your timezone at the moment they reach out. */
export function LocalTime({
  inFooter = false,
}: {
  inFooter?: boolean;
}) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const tick = () => setNow(new Date());
    // Align updates to the minute boundary.
    const toNextMinute = 60000 - (Date.now() % 60000);
    let interval: ReturnType<typeof setInterval>;
    const timeout = setTimeout(() => {
      tick();
      interval = setInterval(tick, 60000);
    }, toNextMinute);
    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, []);

  const time = now.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Kolkata",
  });

  return (
    <span className={`${inFooter && "hidden sm:inline-block"} telemetry`}>
      {profile.location} — {time} IST
    </span>
  );
}
