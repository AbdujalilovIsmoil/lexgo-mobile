import { useCancelUrgent, type UrgentRequest } from "@/entities/admin-callcenter";
import { FormSheet } from "@/shared/ui/admin";
import { Text, confirmDialog } from "@/shared/ui";
import { FormInput, useAppForm } from "@/shared/form";
import { useT } from "@/shared/i18n";
import { cancelSchema } from "../model/ccSchemas";

type Props = { req: UrgentRequest; visible: boolean; onClose: () => void };

// Cancel a request; the reason is shown to the client.
export function CancelSheet({ req, visible, onClose }: Props) {
  const { t } = useT();
  const f = useAppForm(cancelSchema, { reason: "" });
  const m = useCancelUrgent();
  const submit = f.handleSubmit(({ reason }) =>
    confirmDialog({
      title: t("admCcB.cancelReq"), message: t("admCcB.cancelAsk"), confirmLabel: t("admCcB.cancelSubmit"), cancelLabel: t("adm.back"), icon: "x-circle", danger: true,
      onConfirm: async () => { await m.mutateAsync({ id: req.id, reason }); f.reset(); onClose(); },
    }));
  return (
    <FormSheet visible={visible} onClose={onClose} title={t("admCcB.cancelReq")} onSubmit={() => void submit()} submitLabel={t("admCcB.cancelSubmit")} submitting={m.isPending} danger snaps={[0.5, 0.8]}>
      <Text variant="small" tone="gray">{t("admCcB.cancelLead")}</Text>
      <FormInput control={f.control} name="reason" label={t("adm.reason")} placeholder={t("admCcB.reasonPh")} />
    </FormSheet>
  );
}
