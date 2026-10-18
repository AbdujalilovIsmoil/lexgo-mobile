import { Payout, useMarkPaid } from "@/entities/admin-payouts";
import { FactRows, FormSheet, StatusPill } from "@/shared/ui/admin";
import { confirmDialog } from "@/shared/ui";
import { FormInput, useAppForm } from "@/shared/form";
import { fmtDateTime } from "@/shared/lib/format";
import { fmtMoney } from "@/shared/lib/money";
import { useKept } from "@/shared/lib/useKept";
import { useT } from "@/shared/i18n";
import { payoutNoteSchema } from "./payoutNoteSchema";

// One payout: the money breakdown and, until it is paid, "mark as paid" with an optional note.
export function PayoutSheet({ item: current, onClose }: { item: Payout | null; onClose: () => void }) {
  const { t, locale } = useT();
  const item = useKept(current);
  const f = useAppForm(payoutNoteSchema, { note: "" });
  const pay = useMarkPaid();
  const som = (n: number) => `${fmtMoney(n)} ${t("adm.currency")}`;
  const submit = f.handleSubmit(({ note }) =>
    item &&
    confirmDialog({
      title: t("admPay.markPaid"), message: t("admPay.markPaidText", { sum: som(item.sellerShare) }), confirmLabel: t("admPay.markPaid"), cancelLabel: t("adm.cancel"), icon: "check-circle",
      onConfirm: async () => { await pay.mutateAsync({ id: item.id, note }); f.reset(); onClose(); },
    }));
  return (
    <FormSheet visible={!!current} onClose={onClose} title={item ? som(item.sellerShare) : ""} subtitle={t("admPay.sellerShare")} onSubmit={item && item.status !== "paid" ? () => void submit() : undefined} submitLabel={t("admPay.markPaid")} submitting={pay.isPending}>
      {item ? (
        <>
          <FactRows rows={[
            { label: t("adm.status"), value: <StatusPill status={item.status} /> },
            { label: t("admPay.gross"), value: som(item.gross) },
            { label: t("admPay.platformFee"), value: som(item.platformFee) },
            { label: t("admPay.providerFee"), value: som(item.providerFee) },
            { label: t("admPayV.payment"), value: item.paymentId },
            { label: t("admPayV.seller"), value: item.sellerUserId },
            { label: t("adm.created"), value: fmtDateTime(item.createdAt, locale) },
            { label: t("adm.updated"), value: fmtDateTime(item.updatedAt, locale) },
            { label: t("adm.note"), value: item.note },
          ]} />
          {item.status !== "paid" ? <FormInput control={f.control} name="note" label={t("admPay.noteLabel")} placeholder={t("admPay.notePh")} multiline /> : null}
        </>
      ) : null}
    </FormSheet>
  );
}
