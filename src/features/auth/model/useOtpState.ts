import { useState } from "react";
import { useOtpFlow } from "./otpFlowStore";
import { useOtpClock } from "./useOtpClock";

// Everything the OTP screen shows: the typed code, the new password (reset), progress flags and
// the last server answer. One object so the verify / resend hooks can share it.
export function useOtpState() {
  const flow = useOtpFlow((s) => s.flow);
  const [code, setCodeRaw] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [locked, setLocked] = useState(false); // 3 wrong codes: the old code is dead, ask for a new one
  const [totpDead, setTotpDead] = useState(false); // an expired authenticator challenge: sign in again
  const clock = useOtpClock(flow?.challenge.expiresAt ?? 0);
  // Typing after a refusal takes the message away.
  const setCode = (v: string) => {
    setCodeRaw(v);
    if (v) {
      setError(null);
      setNote(null);
    }
  };
  return { flow, code, setCode, password, setPassword, busy, setBusy, resending, setResending, error, setError, note, setNote, locked, setLocked, totpDead, setTotpDead, clock };
}
export type OtpState = ReturnType<typeof useOtpState>;
