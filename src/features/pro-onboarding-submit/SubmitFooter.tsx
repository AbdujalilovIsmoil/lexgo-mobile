import { useSubmitOnboarding, type OnbState } from "@/entities/pro-onboarding";
import { Button, Text, confirmDialog } from "@/shared/ui";
import { useT } from "@/shared/i18n";

type Props = { state: OnbState; complete: boolean };

// "Send for review" (POST /seller-onboarding/submit). The server answers 422 while steps are missing;
// its text is shown as a toast. Hidden once approved, informative while the review is running.
export function SubmitFooter({ state, complete }: Props) {
  const { t } = useT();
  const submit = useSubmitOnboarding();
  if (state === "approved") return null;
  if (state === "submitted") return <Text variant="small" tone="gray" center>{t("sl3.submit.waiting")}</Text>;
  const ask = () =>
    confirmDialog({
      title: t("sl3.submit.title"),
      message: t("sl3.submit.text"),
      confirmLabel: t("sl3.submit.go"),
      cancelLabel: t("adm.cancel"),
      icon: "send",
      onConfirm: async () => {
        await submit.mutateAsync().catch(() => undefined); // the failure is already a toast
      },
    });
  return <Button title={t(state === "rejected" ? "sl3.submit.again" : "sl3.submit.go")} icon="send" full loading={submit.isPending} disabled={!complete} onPress={ask} />;
}
