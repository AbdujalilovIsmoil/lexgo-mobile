import { useEffect, useState } from "react";
import { useAppActive } from "@/shared/lib/useAppActive";

/** Milliseconds left until `until` (NaN when unknown). Ticks once a second only while it is mounted and the app is in front. */
export function useCountdown(until: number): number {
  const active = useAppActive();
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    if (!until || !active) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [until, active]);
  return until ? Math.max(0, until - now) : NaN;
}
