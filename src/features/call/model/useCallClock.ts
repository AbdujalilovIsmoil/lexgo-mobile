import { useEffect, useState } from "react";
import type { Call } from "@/entities/call";

// Elapsed time since the screen opened and the meeting's remaining time. The remaining time is the server's
// value at `snapshotAt` minus the seconds since (every new call snapshot resets it); a paused meeting is frozen.
export function useCallClock(call: Call | null, snapshotAt: number, running: boolean) {
  const [started] = useState(() => Date.now());
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [running]);
  const paused = !!call?.paused;
  const limited = !!call && (call.remaining > 0 || call.maxMinutes > 0);
  const left = !call || !limited ? null : paused ? call.pausedLeft : Math.max(0, call.remaining - Math.floor((now - snapshotAt) / 1000));
  return { elapsed: Math.max(0, Math.floor((now - started) / 1000)), left, paused };
}
