import { useState } from "react";
import { useRouter } from "expo-router";
import { authApi, describeAuthError } from "@/entities/session";
import { rememberConsents, useSignupConsents } from "@/entities/auth-consent";
import { errorHaptic } from "@/shared/lib/haptics";
import { useAuthText } from "./useAuthText";
import { useCountdown } from "./useCountdown";
import { useOtpFlow } from "./otpFlowStore";
import { useRegisterForm } from "./useRegisterForm";

// Step 1 of sign-up: ask the server for a Telegram code for the typed details, then open the OTP screen.
export function useRegister(referral?: string, role?: string) {
  const router = useRouter();
  const text = useAuthText();
  const form = useRegisterForm(referral, role);
  const { docs } = useSignupConsents(form.role);
  const startOtp = useOtpFlow((s) => s.start);
  const wait = useCountdown();
  const [busy, setBusy] = useState(false);
  const [exists, setExists] = useState(false);

  const submit = form.form.handleSubmit(async (raw) => {
    if (busy || wait.left > 0) return;
    const v = form.toInput(raw);
    const input = { ...v, name: [v.firstName, v.lastName, v.middleName].filter(Boolean).join(" ") };
    setBusy(true);
    setExists(false);
    form.setServerError("");
    try {
      const challenge = await authApi.registerStart(input);
      await rememberConsents(v.phone, docs);
      startOtp({ purpose: "register", challenge, phone: v.phone, register: input });
      router.push("/auth/otp");
    } catch (e) {
      errorHaptic();
      const err = describeAuthError(e);
      setExists(err.kind === "exists");
      if (err.wait > 0) wait.start(err.wait);
      form.setServerError(text(err, "register"));
    } finally {
      setBusy(false);
    }
  });

  return { ...form, docs, busy, exists, wait: wait.left, submit };
}
