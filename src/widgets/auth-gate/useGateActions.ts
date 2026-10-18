import { useState } from "react";
import { useRouter } from "expo-router";
import { refreshProfile, useSessionStore } from "@/entities/session";
import { useLogout } from "@/features/auth";
import { useT } from "@/shared/i18n";
import { toast } from "@/shared/ui";
import { useGateStore } from "./gateStore";

// Buttons of the account gate: re-read the account, go on to the seller onboarding, continue, sign out.
export function useGateActions(key: string) {
  const { t } = useT();
  const router = useRouter();
  const dismiss = useGateStore((s) => s.dismiss);
  const { run: signOut } = useLogout();
  const [busy, setBusy] = useState(false);

  const recheck = async () => {
    setBusy(true);
    const r = await refreshProfile();
    setBusy(false);
    const st = useSessionStore.getState().session?.user.accountStatus;
    if (r === "failed") toast(t("common.offline"), "err");
    else if (st && st !== "active") toast(t("au4.stillSame"), "info");
  };
  const onboarding = () => {
    dismiss(key);
    router.push("/pro/onboarding" as never);
  };
  return { busy, recheck, signOut, onboarding, proceed: () => dismiss(key) };
}
