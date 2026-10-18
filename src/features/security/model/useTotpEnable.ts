import { useState } from "react";
import { enableTotp, setupTotp, type TotpSetup } from "@/entities/security";
import { errorHaptic, successHaptic } from "@/shared/lib/haptics";
import { useT } from "@/shared/i18n";
import { toast } from "@/shared/ui";
import { useSecError } from "../lib/useSecError";
import { useSyncProfile } from "../lib/useSyncProfile";

// Authenticator-app 2FA: start() asks for a secret + QR, verify() confirms with the app's current code
// (2FA counts as on only after that: /auth/2fa/totp/enable). Also switches a Telegram-code account
// (mandatory roles) over to the app. `onDone` runs after a successful enable.
export function useTotpEnable(onDone?: () => void) {
  const { t } = useT();
  const msg = useSecError();
  const sync = useSyncProfile();
  const [setup, setSetup] = useState<TotpSetup | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const start = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const s = await setupTotp();
      // Nothing to scan or type → the setup cannot be completed.
      if (!s.setupId || (!s.qrCode && !s.secret && !s.otpauthUrl)) throw new Error("empty setup");
      setError(null);
      setSetup(s);
    } catch (e) {
      errorHaptic();
      toast(msg(e, "admSec.errStart"), "err");
    } finally {
      setBusy(false);
    }
  };

  const verify = async (code: string) => {
    if (!setup || busy || code.length !== 6) return;
    setBusy(true);
    setError(null);
    try {
      await enableTotp(setup.setupId, code);
      await sync();
      successHaptic();
      toast(t("admSec.enabledOk"), "ok");
      setSetup(null);
      onDone?.();
    } catch (e) {
      errorHaptic();
      setError(msg(e, "admSec.errVerify"));
    } finally {
      setBusy(false);
    }
  };

  return { setup, busy, error, start, verify, close: () => { setSetup(null); setError(null); } };
}
