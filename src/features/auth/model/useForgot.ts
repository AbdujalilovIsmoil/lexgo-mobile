import { useState } from "react";
import { useRouter } from "expo-router";
import { authApi, describeAuthError, OTP_TTL_MS } from "@/entities/session";
import { useAppForm } from "@/shared/form";
import { normPhone } from "@/shared/lib/phone";
import { errorHaptic } from "@/shared/lib/haptics";
import { useAuthText } from "./useAuthText";
import { useCountdown } from "./useCountdown";
import { forgotSchema } from "./authSchemas";
import { useOtpFlow } from "./otpFlowStore";

const ttlEnd = (): number => Date.now() + OTP_TTL_MS;

// Forgot password, step 1: a code goes to the Telegram bot; the new password is typed together with
// the code on the next screen. Known and unknown phones look the same (no account enumeration).
export function useForgot() {
  const router = useRouter();
  const text = useAuthText();
  const startOtp = useOtpFlow((s) => s.start);
  const wait = useCountdown();
  const form = useAppForm(forgotSchema, { phone: "" });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = form.handleSubmit(async ({ phone }) => {
    const p = normPhone(phone);
    if (busy || wait.left > 0) return;
    setError(null);
    setBusy(true);
    try {
      const challenge = await authApi.forgotPassword(p);
      startOtp({ purpose: "reset", challenge, phone: p });
      router.push("/auth/otp");
    } catch (e) {
      const err = describeAuthError(e);
      if (err.status === 404) {
        startOtp({ purpose: "reset", challenge: { verificationId: "", phone: p, message: "", expiresAt: ttlEnd() }, phone: p });
        return router.push("/auth/otp");
      }
      errorHaptic();
      if (err.wait > 0) wait.start(err.wait);
      setError(text(err, "otp"));
    } finally {
      setBusy(false);
    }
  });

  return { control: form.control, error, busy, wait: wait.left, submit };
}
