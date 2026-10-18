import { useCallback, useState } from "react";
import { authenticate, type UnlockResult } from "@/entities/auth-lock";
import { useLockStore } from "@/entities/session";
import { useT } from "@/shared/i18n";
import { errorHaptic, successHaptic } from "@/shared/lib/haptics";

// The lock screen's unlock: one system prompt; success lifts the lock, anything else keeps it and
// reports why (cancelled, system lockout after too many misses, no biometrics any more …).
export function useUnlock() {
  const { t } = useT();
  const [status, setStatus] = useState<UnlockResult | null>(null);
  const [busy, setBusy] = useState(false);
  const run = useCallback(async () => {
    if (busy) return;
    setBusy(true);
    const r = await authenticate(t("au5.prompt"), t("common.cancel"));
    setBusy(false);
    setStatus(r);
    if (r === "ok") {
      successHaptic();
      useLockStore.getState().unlock();
    } else if (r !== "cancel") errorHaptic();
  }, [busy, t]);
  return { status, busy, run };
}
