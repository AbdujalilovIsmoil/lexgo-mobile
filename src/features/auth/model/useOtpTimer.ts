import { useEffect, useState } from "react";

// Counts down to `expiresAt` (epoch ms). 0 → "no deadline known".
export function useOtpTimer(expiresAt: number) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!expiresAt) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [expiresAt]);
  const leftMs = expiresAt ? Math.max(0, expiresAt - now) : 0;
  return { leftMs, expired: !!expiresAt && leftMs === 0, known: !!expiresAt };
}
