import { useCallback, useEffect } from "react";
import { BackHandler } from "react-native";
import { useRouter } from "expo-router";
import { confirmDialog } from "@/shared/ui";
import { useT } from "@/shared/i18n";

// Leaving the editor (header back or Android back): asks first while changes are still being saved.
export function useLeave(saving: boolean): () => void {
  const router = useRouter();
  const { t } = useT();
  const back = useCallback(() => (router.canGoBack() ? router.back() : router.replace("/pro/docs" as never)), [router]);
  const leave = useCallback(() => {
    if (!saving) return back();
    confirmDialog({ title: t("ad5.leaveTitle"), message: t("ad5.leaveAsk"), confirmLabel: t("ad5.leaveYes"), cancelLabel: t("common.cancel"), icon: "log-out", danger: true, onConfirm: back });
  }, [saving, back, t]);
  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      leave();
      return true;
    });
    return () => sub.remove();
  }, [leave]);
  return leave;
}
