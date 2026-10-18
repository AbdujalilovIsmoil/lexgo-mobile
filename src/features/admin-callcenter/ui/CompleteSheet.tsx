import { useCompleteUrgent, type UrgentRequest } from "@/entities/admin-callcenter";
import { FormSheet } from "@/shared/ui/admin";
import { Text, confirmDialog } from "@/shared/ui";
import { FormInput, useAppForm } from "@/shared/form";
import { useT } from "@/shared/i18n";
import { completeSchema } from "../model/ccSchemas";

type Props = { req: UrgentRequest; visible: boolean; onClose: () => void };

// Write the result: it reaches the client as a notification and a message in the secure chat.
export function CompleteSheet({ req, visible, onClose }: Props) {
  const { t } = useT();
  const f = useAppForm(completeSchema, { summary: "", next: "" });
  const m = useCompleteUrgent();
  const submit = f.handleSubmit(({ summary, next }) =>
    confirmDialog({
      title: t("admCcB.complete"), message: t("admCcB.completeAsk"), confirmLabel: t("admCcB.completeSubmit"), cancelLabel: t("adm.cancel"), icon: "check-circle",
      onConfirm: async () => { await m.mutateAsync({ id: req.id, summary, nextAction: next }); f.reset(); onClose(); },
    }));
  return (
    <FormSheet visible={visible} onClose={onClose} title={t("admCcB.complete")} onSubmit={() => void submit()} submitLabel={t("admCcB.completeSubmit")} submitting={m.isPending} snaps={[0.62, 0.92]}>
      <Text variant="small" tone="gray">{t("admCcB.completeLead")}</Text>
      <FormInput control={f.control} name="summary" label={t("admCcB.summary")} placeholder={t("admCcB.summaryPh")} multiline style={{ minHeight: 90 }} />
      <FormInput control={f.control} name="next" label={t("admCc.nextAction")} placeholder={t("admCcB.completeNextPh")} />
    </FormSheet>
  );
}
