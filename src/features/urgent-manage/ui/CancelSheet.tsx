import { useCancelRequest, type UrgentRequest } from "@/entities/urgent";
import { FormSheet } from "@/shared/ui/admin";
import { Text, confirmDialog } from "@/shared/ui";
import { FormInput, useAppForm } from "@/shared/form";
import { useSheetReset } from "@/shared/lib/useSheetReset";
import { useT } from "@/shared/i18n";
import { cancelSchema } from "./cancelSchema";

type Props = { req: UrgentRequest; visible: boolean; onClose: () => void };

// Cancel a request on the client's behalf; the reason is shown to the client.
export function CancelSheet({ req, visible, onClose }: Props) {
  const { t } = useT();
  const f = useAppForm(cancelSchema, { reason: "" });
  const m = useCancelRequest();
  useSheetReset(visible, () => f.reset({ reason: "" }));
  const submit = f.handleSubmit((v) =>
    confirmDialog({
      title: t("ug8.cancel"), message: t("ug8.cancelAsk"), confirmLabel: t("ug8.cancelSubmit"), cancelLabel: t("adm.back"), icon: "x-circle", danger: true,
      onConfirm: async () => { await m.mutateAsync({ id: req.id, reason: v.reason }); onClose(); },
    }));
  return (
    <FormSheet visible={visible} onClose={onClose} title={t("ug8.cancel")} onSubmit={() => void submit()} submitLabel={t("ug8.cancelSubmit")} submitting={m.isPending} danger snaps={[0.5, 0.8]}>
      <Text variant="small" tone="gray">{t("ug8.cancelLead")}</Text>
      <FormInput control={f.control} name="reason" label={t("adm.reason")} placeholder={t("ug8.reasonPh")} />
    </FormSheet>
  );
}
