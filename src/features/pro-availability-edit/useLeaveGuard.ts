import { useEffect } from "react";
import { useNavigation } from "expo-router";
import { confirmDialog } from "@/shared/ui";
import { useT } from "@/shared/i18n";

// Asks before leaving the screen with unsaved schedule changes (back button, swipe, hardware back).
export function useLeaveGuard(enabled: boolean) {
  const nav = useNavigation();
  const { t } = useT();
  useEffect(
    () =>
      nav.addListener("beforeRemove", (e) => {
        if (!enabled) return;
        e.preventDefault();
        confirmDialog({
          title: t("availUx.leave.title"),
          message: t("availUx.leave.lead"),
          confirmLabel: t("availUx.leave.confirm"),
          cancelLabel: t("availUx.cancel"),
          icon: "alert-circle",
          danger: true,
          onConfirm: () => nav.dispatch(e.data.action),
        });
      }),
    [nav, enabled, t],
  );
}
