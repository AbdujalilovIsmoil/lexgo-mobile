import { useState } from "react";
import { disable2fa } from "@/entities/security";
import { ApiError } from "@/shared/api";
import { errorHaptic, successHaptic } from "@/shared/lib/haptics";
import { useT } from "@/shared/i18n";
import { confirmDialog, toast } from "@/shared/ui";
import { useSecError } from "../lib/useSecError";
import { useSyncProfile } from "../lib/useSyncProfile";

// Turn 2FA off after a confirmation. The server answers 403 for roles that must keep it on.
export function useDisableTwoFactor() {
  const { t } = useT();
  const msg = useSecError();
  const sync = useSyncProfile();
  const [busy, setBusy] = useState(false);

  const run = async () => {
    setBusy(true);
    try {
      await disable2fa();
      await sync();
      successHaptic();
      toast(t("admSec.disabledOk"), "ok");
    } catch (e) {
      errorHaptic();
      toast(e instanceof ApiError && e.status === 403 ? t("admSec.mandatory") : msg(e, "admSec.errStart"), "err");
    } finally {
      setBusy(false);
    }
  };

  const ask = () =>
    confirmDialog({
      title: t("admSec.disableTitle"), message: t("admSec.disableText"), confirmLabel: t("admSec.disable"), cancelLabel: t("adm.cancel"), icon: "shield-off", danger: true, onConfirm: run,
    });

  return { busy, ask };
}
