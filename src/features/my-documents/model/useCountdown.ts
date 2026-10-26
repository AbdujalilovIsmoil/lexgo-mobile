import { useEffect, useRef, useState } from "react";

// Seconds left in a server-owned window, drawn from the server's own count (or its deadline);
// null = nothing to count. Decoration only: the backend flag stays the decision. It stops ticking at 0 (or with nothing to count).
export function useCountdown(remaining: number, deadlineAt: string): number | null {
  const base = useRef({ at: 0, s: remaining, dl: 0 });
  const [left, setLeft] = useState<number | null>(remaining > 0 ? remaining : null);
  useEffect(() => {
    base.current = { at: Date.now(), s: remaining, dl: deadlineAt ? Date.parse(deadlineAt) : 0 };
    const tick = (): boolean => {
      const b = base.current;
      const sec = b.s > 0 ? b.s - (Date.now() - b.at) / 1000 : b.dl > 0 ? (b.dl - Date.now()) / 1000 : null;
      const next = sec === null || Number.isNaN(sec) ? null : Math.max(0, Math.round(sec));
      setLeft(next);
      return next !== null && next > 0;
    };
    if (!tick()) return;
    const id = setInterval(() => { if (!tick()) clearInterval(id); }, 1000);
    return () => clearInterval(id);
  }, [remaining, deadlineAt]);
  return left;
}
