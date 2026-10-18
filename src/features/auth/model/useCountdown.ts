import { useEffect, useState } from "react";

// A visible wait ("try again in 0:49"): start(sec) from a handler, `left` ticks down once a second.
export function useCountdown() {
  const [until, setUntil] = useState(0);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!until) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [until]);
  return {
    left: until ? Math.max(0, Math.ceil((until - now) / 1000)) : 0,
    start: (sec: number) => {
      setNow(Date.now());
      setUntil(sec > 0 ? Date.now() + sec * 1000 : 0);
    },
  };
}
