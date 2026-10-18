import { useCancelOwn, type UrgentRequest } from "@/entities/urgent";
import { FormSheet } from "@/shared/ui/admin";
import { Text, confirmDialog } from "@/shared/ui";
import { FormInput, useAppForm } from "@/shared/form";
import { useSheetReset } from "@/shared/lib/useSheetReset";
import { useT } from "@/shared/i18n";
import { cancelOwnSchema } from "./cancelOwnSchema";

type Props = { req: UrgentRequest; visible: boolean; onClose: () => void };

// The owner cancels their own request; the reason is optional (the app supplies a default so the record is never blank).
export function CancelOwnSheet({ req, visible, onClose }: Props) {
  const { t } = useT();
  const f = useAppForm(cancelOwnSchema, { reason: "" });
  const m = useCancelOwn();
  useSheetReset(visible, () => f.reset({ reason: "" }));
  const submit = f.handleSubmit((v) =>
    confirmDialog({
      title: t("ug3.cancelTitle"), message: t("ug3.cancelAsk"), confirmLabel: t("ug3.cancelConfirm"), cancelLabel: t("ug3.keepIt"), icon: "x-circle", danger: true,
      onConfirm: async () => { await m.mutateAsync({ id: req.id, reason: v.reason || t("ug3.cancelDefault") }); onClose(); },
    }));
  return (
    <FormSheet visible={visible} onClose={onClose} title={t("ug3.cancelTitle")} onSubmit={() => void submit()} submitLabel={t("ug3.cancelConfirm")} submitting={m.isPending} danger snaps={[0.5, 0.8]}>
      <Text variant="small" tone="gray">{t("ug3.cancelLead")}</Text>
      <FormInput control={f.control} name="reason" label={t("adm.reason")} placeholder={t("ug3.cancelReasonPh")} />
    </FormSheet>
  );
}
