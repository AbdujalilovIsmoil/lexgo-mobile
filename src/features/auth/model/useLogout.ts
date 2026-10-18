import { authApi, useSessionStore } from "@/entities/session";
import { confirmDialog } from "@/shared/ui";
import { useT } from "@/shared/i18n";

// Sign out: revoke the refresh session on the server (best effort, with the tokens captured now), then
// wipe tokens, the stored profile, the lock and every cached per-user thing. The react-query cache is
// cleared by SessionBoundary when the user context becomes empty; signOut runs the session cleaners.
export function useLogout() {
  const { t } = useT();

  const run = async () => {
    const s = useSessionStore.getState().session;
    if (s) void authApi.logout(s.refreshToken, s.token);
    await useSessionStore.getState().signOut();
  };

  const confirm = () =>
    confirmDialog({
      title: t("profile.logout"),
      message: t("profile.logoutConfirm"),
      confirmLabel: t("profile.logout"),
      cancelLabel: t("common.cancel"),
      icon: "log-out",
      danger: true,
      onConfirm: run,
    });

  return { confirm, run };
}
