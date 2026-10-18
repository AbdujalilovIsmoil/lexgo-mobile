import { useCallback, useEffect, useState } from "react";

export const OTP_RESEND_SEC = 60; // the server answers "wait" (429) for a second code inside this window

type Clock = { expiresAt: number; resendAt: number; blockedUntil: number }; // epoch ms, 0 = none
const IDLE: Clock = { expiresAt: 0, resendAt: 0, blockedUntil: 0 };

// Code expiry, resend cooldown and wrong-code block of one OTP step (components/auth/OtpStatus on
// the web). Deadlines are written from handlers; a 1 s tick only moves "now".
export function useOtpClock(expiresAt: number, cooldownSec = OTP_RESEND_SEC) {
  const [c, setC] = useState<Clock>(() => ({ ...IDLE, expiresAt, resendAt: Date.now() + cooldownSec * 1000 }));
  const [now, setNow] = useState(() => Date.now());
  const end = Math.max(c.expiresAt, c.resendAt, c.blockedUntil);
  useEffect(() => {
    if (!end) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [end]);

  const set = useCallback((patch: (p: Clock, t: number) => Clock) => {
    const t = Date.now();
    setNow(t);
    setC((p) => patch(p, t));
  }, []);
  const left = (at: number) => (at ? Math.max(0, Math.ceil((at - now) / 1000)) : 0);
  return {
    expiresIn: left(c.expiresAt),
    resendIn: left(c.resendAt),
    blockedIn: left(c.blockedUntil),
    known: c.expiresAt > 0,
    expired: c.expiresAt > 0 && c.expiresAt <= now,
    // A new code replaces the old one: fresh expiry + cooldown, any block is over.
    issue: (expiresAtMs: number) => set((_, t) => ({ expiresAt: expiresAtMs, resendAt: t + OTP_RESEND_SEC * 1000, blockedUntil: 0 })),
    cooldown: (sec: number) => set((p, t) => ({ ...p, resendAt: t + Math.max(0, sec) * 1000 })),
    block: (sec: number) => set((p, t) => ({ ...p, blockedUntil: t + Math.max(0, sec) * 1000 })),
    expire: () => set((p, t) => ({ ...p, expiresAt: t })),
  };
}
export type OtpClock = ReturnType<typeof useOtpClock>;
