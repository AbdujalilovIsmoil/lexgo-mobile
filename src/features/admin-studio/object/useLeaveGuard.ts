import { useEffect, useRef } from "react";
import { useNavigation } from "expo-router";
import { confirmDialog } from "@/shared/ui";
import { useT } from "@/shared/i18n";

// Asks before leaving the editor with unsaved changes (back button, swipe, hardware back).
// release() lets the next navigation through (after a save that replaces the route).
export function useLeaveGuard(enabled: boolean) {
  const nav = useNavigation();
  const { t } = useT();
  const allow = useRef(false);
  useEffect(
    () =>
      nav.addListener("beforeRemove", (e) => {
        if (!enabled || allow.current) return;
        e.preventDefault();
        confirmDialog({
          title: t("admStudioB.leave.title"),
          message: t("admStudioB.leave.lead"),
          confirmLabel: t("admStudioB.leave.confirm"),
          cancelLabel: t("adm.cancel"),
          icon: "alert-circle",
          danger: true,
          onConfirm: () => {
            allow.current = true;
            nav.dispatch(e.data.action);
          },
        });
      }),
    [nav, enabled, t],
  );
  return { release: () => void (allow.current = true) };
}
