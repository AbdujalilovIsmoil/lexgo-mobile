import { revokeSession, secKeys, type DeviceSession } from "@/entities/security";
import { authApi, useSessionStore } from "@/entities/session";
import { useAdminMutation } from "@/shared/lib/useAdminMutation";
import { useT } from "@/shared/i18n";
import { confirmDialog } from "@/shared/ui";

// Sign a device out (DELETE /auth/sessions/{id}) after a confirmation. If the backend flags the
// row as this device the app signs out too; otherwise /auth/me is probed so a dead token is noticed.
export function useRevokeSession() {
  const { t } = useT();
  const m = useAdminMutation({ mutationFn: (s: DeviceSession) => revokeSession(s.id), invalidate: [secKeys.sessions], success: "admSecB.revoked" });
  return (s: DeviceSession) =>
    confirmDialog({
      title: t("admSecB.revokeTitle"), message: t(s.current ? "admSecB.revokeThis" : "admSecB.revokeText"), confirmLabel: t("admSecB.revoke"), cancelLabel: t("adm.cancel"), icon: "log-out", danger: true,
      onConfirm: async () => {
        try {
          await m.mutateAsync(s); // failures are toasted by the mutation
        } catch {
          return;
        }
        if (s.current) await useSessionStore.getState().signOut();
        else void authApi.me().catch(() => {});
      },
    });
}
