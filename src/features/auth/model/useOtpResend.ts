import { authApi, type OtpChallenge, type Session } from "@/entities/session";
import { useT } from "@/shared/i18n";
import { useOtpFlow, type OtpFlow } from "./otpFlowStore";
import { useOtpFailure } from "./useOtpFailure";
import type { OtpState } from "./useOtpState";

// A new code for the same step: register → start again, reset → forgot again, 2FA login → sign in
// again (the old code is superseded). A Session comes back when 2FA was switched off meanwhile.
async function requestCode(f: OtpFlow): Promise<OtpChallenge | Session> {
  if (f.purpose === "reset") return authApi.forgotPassword(f.phone);
  if (f.purpose === "register" && f.register) return authApi.registerStart(f.register);
  const r = await authApi.login(f.phone, f.password ?? "");
  return r;
}

export function useOtpResend(ui: OtpState, onSession: (s: Session) => Promise<void>) {
  const { t } = useT();
  const update = useOtpFlow((s) => s.update);
  const fail = useOtpFailure(ui);
  const { flow, clock } = ui;
  return async () => {
    if (!flow || flow.totp || ui.busy || ui.resending || clock.resendIn > 0 || clock.blockedIn > 0) return;
    ui.setResending(true);
    ui.setError(null);
    try {
      const next = await requestCode(flow);
      if ("token" in next) return await onSession(next);
      update(next);
      clock.issue(next.expiresAt);
      ui.setLocked(false);
      ui.setCode("");
      ui.setNote(t("au2.resent"));
    } catch (e) {
      fail(e, flow.purpose === "login2fa" ? "login" : "otp", true);
    } finally {
      ui.setResending(false);
    }
  };
}
