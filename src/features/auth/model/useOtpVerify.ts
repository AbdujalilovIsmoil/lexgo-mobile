import { useRouter } from "expo-router";
import { authApi } from "@/entities/session";
import { useT } from "@/shared/i18n";
import { successHaptic } from "@/shared/lib/haptics";
import { toast } from "@/shared/ui";
import { useOtpFlow } from "./otpFlowStore";
import { useAuthFinish } from "./useAuthFinish";
import { useOtpFailure } from "./useOtpFailure";
import { useOtpResend } from "./useOtpResend";
import { useOtpState } from "./useOtpState";

const MIN_PASSWORD = 8;

// Verifies the code of whichever flow is pending: register (→ session or "waiting for an admin"),
// 2FA login (Telegram code or authenticator) and password reset (code + new password together).
export function useOtpVerify() {
  const { t } = useT();
  const router = useRouter();
  const clear = useOtpFlow((s) => s.clear);
  const ui = useOtpState();
  const finish = useAuthFinish();
  const fail = useOtpFailure(ui);
  const resend = useOtpResend(ui, finish);
  const { flow, clock } = ui;

  const verify = async (typed: string) => {
    if (!flow || ui.busy || ui.resending || clock.blockedIn > 0 || typed.length < 6) return;
    if (flow.purpose === "reset" && ui.password.length < MIN_PASSWORD) return ui.setError(t("auth.passwordHint"));
    ui.setBusy(true);
    ui.setError(null);
    const vid = flow.challenge.verificationId;
    try {
      if (flow.purpose === "login2fa") return await finish(await authApi.loginVerify2fa(vid, typed));
      if (flow.purpose === "reset") {
        await authApi.resetPassword(vid, typed, ui.password);
        clear();
        toast(t("auth.resetDone"), "ok");
        return router.replace("/auth/login");
      }
      const res = await authApi.registerVerify(vid, typed);
      if (res.kind === "session") return await finish(res.session);
      clear();
      successHaptic();
      if (res.kind === "pending") return router.replace({ pathname: "/auth/pending", params: { role: res.role, message: res.message } });
      toast(res.message || t("au1.loginRequired"), "info");
      router.replace("/auth/login");
    } catch (e) {
      fail(e);
    } finally {
      ui.setBusy(false);
    }
  };

  return { ...ui, verify, resend };
}
