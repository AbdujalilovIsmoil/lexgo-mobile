import { useState } from "react";
import { authenticate, useBioInfo } from "@/entities/auth-lock";
import { useLockStore, useSession } from "@/entities/session";
import { useT } from "@/shared/i18n";
import { errorHaptic, successHaptic } from "@/shared/lib/haptics";
import { toast } from "@/shared/ui";

// /settings/security-lock: switch the app lock on / off (both need a passed system prompt, so a
// borrowed unlocked phone cannot turn it off), choose the grace period, try an unlock.
export function useLockSettings() {
  const { t } = useT();
  const user = useSession()?.user;
  const lock = useLockStore();
  const info = useBioInfo();
  const [busy, setBusy] = useState(false);

  const confirm = async (key: string): Promise<boolean> => {
    setBusy(true);
    const r = await authenticate(t(key), t("common.cancel"));
    setBusy(false);
    if (r === "ok") return true;
    if (r !== "cancel") {
      errorHaptic();
      toast(t("au5.notConfirmed"), "err");
    }
    return false;
  };

  const toggle = async (on: boolean) => {
    if (!user || busy) return;
    if (on && !info.data?.canLock) return toast(t("au5.unavailable"), "err");
    if (!(await confirm(on ? "au5.confirmOn" : "au5.confirmOff"))) return;
    if (on) await lock.enable(user.id, lock.timeoutMin || 1);
    else await lock.disable();
    successHaptic();
    toast(t(on ? "au5.enabled" : "au5.disabled"), "ok");
  };

  const test = async () => {
    if (await confirm("au5.prompt")) toast(t("au5.testOk"), "ok");
  };

  return { enabled: lock.enabled, timeoutMin: lock.timeoutMin, setTimeoutMin: lock.setTimeoutMin, info: info.data, loading: info.isLoading, busy, toggle, test };
}
