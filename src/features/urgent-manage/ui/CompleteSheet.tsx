import { useCompleteRequest, type UrgentRequest } from "@/entities/urgent";
import { FormSheet } from "@/shared/ui/admin";
import { Text, confirmDialog } from "@/shared/ui";
import { FormInput, useAppForm } from "@/shared/form";
import { useSheetReset } from "@/shared/lib/useSheetReset";
import { useT } from "@/shared/i18n";
import { completeSchema } from "./completeSchema";

type Props = { req: UrgentRequest; visible: boolean; onClose: () => void };

// Write the result: it reaches the client as a notification and a message in the secure chat, and opens their rating window.
export function CompleteSheet({ req, visible, onClose }: Props) {
  const { t } = useT();
  const f = useAppForm(completeSchema, { summary: "", next: "" });
  const m = useCompleteRequest();
  useSheetReset(visible, () => f.reset({ summary: "", next: "" }));
  const submit = f.handleSubmit((v) =>
    confirmDialog({
      title: t("ug8.complete"), message: t("ug8.completeAsk"), confirmLabel: t("ug8.completeSubmit"), cancelLabel: t("adm.cancel"), icon: "check-circle",
      onConfirm: async () => { await m.mutateAsync({ id: req.id, summary: v.summary, nextAction: v.next }); onClose(); },
    }));
  return (
    <FormSheet visible={visible} onClose={onClose} title={t("ug8.complete")} onSubmit={() => void submit()} submitLabel={t("ug8.completeSubmit")} submitting={m.isPending} snaps={[0.62, 0.92]}>
      <Text variant="small" tone="gray">{t("ug8.completeLead")}</Text>
      <FormInput control={f.control} name="summary" label={t("ug8.summary")} placeholder={t("ug8.summaryPh")} multiline style={{ minHeight: 90 }} />
      <FormInput control={f.control} name="next" label={t("ug7.nextAction")} placeholder={t("ug8.nextPh")} />
    </FormSheet>
  );
}
