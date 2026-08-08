import { useSyncExternalStore } from "react";
import { profile } from "@/data/content";

/**
 * Shared minute-aligned clock. `LocalTime` is mounted once in the desktop
 * header and once in the Contact footer (only one visible at a time per
 * breakpoint, but both stay mounted) — one shared timer instead of two
 * independent ones ticking on their own schedules.
 */
let now = Date.now();
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setTimeout> | undefined;

function ensureClock() {
  if (timer !== undefined) return;
  const tick = () => {
    now = Date.now();
    listeners.forEach((listener) => listener());
  };
  // Align updates to the minute boundary.
  const toNextMinute = 60000 - (Date.now() % 60000);
  timer = setTimeout(() => {
    tick();
    timer = setInterval(tick, 60000);
  }, toNextMinute);
}

function subscribe(listener: () => void) {
  ensureClock();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && timer !== undefined) {
      clearTimeout(timer);
      clearInterval(timer);
      timer = undefined;
    }
  };
}

function getSnapshot() {
  return now;
}

function useMinuteClock() {
  return useSyncExternalStore(subscribe, getSnapshot);
}

/** Live local time — tells visitors your timezone at the moment they reach out. */
export function LocalTime({
  inFooter = false,
}: {
  inFooter?: boolean;
}) {
  const now = useMinuteClock();

  const time = new Date(now).toLocaleTimeString("en-IN", {
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
