import { useState } from "react";
import { useRouter } from "expo-router";
import { authApi, describeAuthError, isTwoFactor, retryAfterOf } from "@/entities/session";
import { useAppForm } from "@/shared/form";
import { normPhone } from "@/shared/lib/phone";
import { useT } from "@/shared/i18n";
import { errorHaptic } from "@/shared/lib/haptics";
import { useAuthFinish } from "./useAuthFinish";
import { useAuthText } from "./useAuthText";
import { useCountdown } from "./useCountdown";
import { loginSchema } from "./authSchemas";
import { useOtpFlow } from "./otpFlowStore";

// A run of wrong passwords earns a short local pause (3rd miss 5 s, then 10, 20, 40, 60) on top of
// the server's own limit (429 + Retry-After).
const pause = (misses: number) => (misses >= 3 ? Math.min(60, 5 * 2 ** (misses - 3)) : 0);

export function useLogin() {
  const { t } = useT();
  const router = useRouter();
  const text = useAuthText();
  const finish = useAuthFinish();
  const startOtp = useOtpFlow((s) => s.start);
  const wait = useCountdown();
  const form = useAppForm(loginSchema, { phone: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [misses, setMisses] = useState(0);

  const submit = form.handleSubmit(async ({ phone, password }) => {
    const p = normPhone(phone);
    if (busy || wait.left > 0) return;
    setError(null);
    setBusy(true);
    try {
      const res = await authApi.login(p, password);
      setMisses(0);
      if (!isTwoFactor(res)) return await finish(res);
      if (!res.verificationId) return setError(res.message || t("common.serverError"));
      startOtp({ purpose: "login2fa", challenge: res, phone: p, password, totp: res.method === "totp" });
      router.push("/auth/otp");
    } catch (e) {
      errorHaptic();
      const err = describeAuthError(e);
      const n = err.kind === "wrong" ? misses + 1 : misses;
      setMisses(n);
      wait.start(err.kind === "rate" || err.kind === "blocked" ? retryAfterOf(e) || 60 : pause(n));
      setError(text(err, "login"));
    } finally {
      setBusy(false);
    }
  });

  return { control: form.control, error, busy, wait: wait.left, submit };
}
