import { createRefundRequest, fmtUzs, paymentTitle, type PaymentRow } from "@/entities/payment";
import { FormSheet } from "@/shared/ui/admin";
import { useAdminMutation } from "@/shared/lib/useAdminMutation";
import { useSheetReset } from "@/shared/lib/useSheetReset";
import { FormInput, rules, useAppForm } from "@/shared/form";
import { toast } from "@/shared/ui";
import { useT } from "@/shared/i18n";

// A refund REQUEST for a paid payment: the call centre reviews it, nothing is returned by the app.
export function RefundSheet({ payment, visible, onClose }: { payment: PaymentRow; visible: boolean; onClose: () => void }) {
  const { t } = useT();
  const f = useAppForm(rules.reason, { reason: "" });
  useSheetReset(visible, () => f.reset({ reason: "" }));
  const m = useAdminMutation({
    mutationFn: (reason: string) => createRefundRequest({ paymentId: payment.id, reason, amount: payment.amount, title: paymentTitle(payment, t) }),
    onSuccess: (workId) => {
      toast(workId ? t("py2.refund.sentId", { id: workId }) : t("py2.refund.sent"), "ok");
      onClose();
    },
  });
  return (
    <FormSheet visible={visible} onClose={onClose} title={t("py2.refund.title")} subtitle={fmtUzs(payment.amount, t)} submitLabel={t("py2.refund.send")} onSubmit={() => void f.handleSubmit((v) => m.mutate(v.reason))()} submitting={m.isPending}>
      <FormInput control={f.control} name="reason" label={t("py2.refund.reason")} multiline numberOfLines={4} maxLength={1000} placeholder={t("py2.refund.reasonPh")} hint={t("py2.refund.hint")} style={{ minHeight: 96, textAlignVertical: "top" }} />
    </FormSheet>
  );
}
