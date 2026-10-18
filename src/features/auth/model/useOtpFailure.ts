import { describeAuthError } from "@/entities/session";
import { errorHaptic } from "@/shared/lib/haptics";
import type { OtpState } from "./useOtpState";
import { useAuthText } from "./useAuthText";

// Maps a failed verification (or resend) onto the OTP screen: wrong → drain the slots, rate → count the
// server's wait down (on a resend only the resend button waits), blocked → the old code is dead too,
// expired → "ask again" (authenticator: sign in again).
export function useOtpFailure(ui: OtpState) {
  const text = useAuthText();
  return (e: unknown, ctx: "otp" | "login" = "otp", resend = false) => {
    errorHaptic();
    const err = describeAuthError(e);
    if (err.kind === "rate" && resend) ui.clock.cooldown(err.wait || 60);
    else if (err.kind === "rate" || err.kind === "blocked") {
      ui.clock.block(err.wait || 60);
      ui.setLocked(err.kind === "blocked");
      ui.setCode("");
    } else if (err.kind === "expired") {
      if (ui.flow?.totp) ui.setTotpDead(true);
      else ui.clock.expire();
      ui.setCode("");
    } else if (err.kind === "wrong") ui.setCode("");
    ui.setError(err.kind === "expired" ? null : text(err, ctx));
    return err;
  };
}
