import { useEffect, useState } from "react";
import { profile } from "@/data/content";

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
