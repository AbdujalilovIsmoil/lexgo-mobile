import { useRequestVerification } from "@/entities/pro-profile";
import { Button, confirmDialog } from "@/shared/ui";
import { useT } from "@/shared/i18n";

// Asks the moderators to check the profile (POST /lawyers/me/verifications, check_type "manual").
export function VerificationButton({ disabled }: { disabled?: boolean }) {
  const { t } = useT();
  const req = useRequestVerification();
  const ask = () =>
    confirmDialog({
      title: t("sl4.verify.title"),
      message: t("sl4.verify.text"),
      confirmLabel: t("sl4.verify.go"),
      cancelLabel: t("adm.cancel"),
      icon: "shield",
      onConfirm: async () => {
        await req.mutateAsync().catch(() => undefined);
      },
    });
  return <Button title={t("sl4.verify.go")} icon="shield" variant="soft" size="sm" loading={req.isPending} disabled={disabled} onPress={ask} />;
}
