import { useState } from "react";
import { start2fa, verify2fa, type OtpStart } from "@/entities/security";
import { errorHaptic, successHaptic } from "@/shared/lib/haptics";
import { useT } from "@/shared/i18n";
import { toast } from "@/shared/ui";
import { useSecError } from "../lib/useSecError";
import { useSyncProfile } from "../lib/useSyncProfile";

// Enable 2FA with a code sent to the Telegram bot (or SMS when no bot chat is linked):
// start() issues a code (and re-issues it for "resend"), verify() confirms it.
export function useCodeEnable() {
  const { t } = useT();
  const msg = useSecError();
  const sync = useSyncProfile();
  const [step, setStep] = useState<OtpStart | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const start = async () => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const r = await start2fa();
      if (!r.verificationId) throw new Error("no verification id");
      setStep(r);
    } catch (e) {
      errorHaptic();
      if (step) setError(msg(e, "admSec.errStart"));
      else toast(msg(e, "admSec.errStart"), "err");
    } finally {
      setBusy(false);
    }
  };

  const verify = async (code: string) => {
    if (!step || busy || code.length !== 6) return;
    setBusy(true);
    setError(null);
    try {
      await verify2fa(step.verificationId, code);
      await sync();
      successHaptic();
      toast(t("admSec.enabledOk"), "ok");
      setStep(null);
    } catch (e) {
      errorHaptic();
      setError(msg(e, "admSec.errVerify"));
    } finally {
      setBusy(false);
    }
  };

  return { step, busy, error, start, verify, close: () => { setStep(null); setError(null); } };
}
