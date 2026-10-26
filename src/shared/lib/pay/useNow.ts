import { useEffect, useState } from "react";

// Re-renders every `ms` while `active`, returning the current epoch ms (countdowns). Past `until` (epoch ms, the deadline counted down
// to) it stops ticking: a finished countdown no longer re-renders its row every second.
export function useNow(active: boolean, ms = 1000, until = Infinity): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => {
      const t = Date.now();
      setNow(t);
      if (t >= until) clearInterval(id);
    }, ms);
    return () => clearInterval(id);
  }, [active, ms, until]);
  return now;
}
