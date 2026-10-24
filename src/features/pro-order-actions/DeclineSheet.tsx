import { DECLINE_REASONS, useDeclineOrder, type ProOrder } from "@/entities/pro-order";
import { FormInput, useAppForm } from "@/shared/form";
import { FormSheet, SelectField } from "@/shared/ui/admin";
import { useSheetReset } from "@/shared/lib/useSheetReset";
import { useT } from "@/shared/i18n";
import { declineSchema } from "./noteSchema";

// `onSubmit` / `submitting` let a caller send the answer itself (an assignment card that shows the expiry in place).
type Props = { order: ProOrder; visible: boolean; onClose: () => void; onSubmit?: (v: { reason: string; note: string }) => void; submitting?: boolean };
const EMPTY = { reason: "busy", note: "" };

// Decline an order that has been sent to the seller: one of the backend reasons (+ a note, required for "other").
export function DeclineSheet({ order, visible, onClose, onSubmit, submitting }: Props) {
  const { t } = useT();
  const f = useAppForm(declineSchema, EMPTY);
  const decline = useDeclineOrder(onClose);
  useSheetReset(visible, () => f.reset(EMPTY));
  const submit = f.handleSubmit((v) => (onSubmit ? onSubmit({ reason: v.reason, note: v.note }) : decline.mutate({ id: order.id, reason: v.reason, note: v.note })));
  return (
    <FormSheet visible={visible} onClose={onClose} title={t("sl9.declineTitle")} subtitle={t("sl9.declineText")} onSubmit={() => void submit()} submitLabel={t("sl9.decline")} submitting={submitting ?? decline.isPending} danger>
      <SelectField label={t("sl9.reason")} value={f.watch("reason")} options={DECLINE_REASONS.map((r) => ({ value: r, label: t(`sl12.reasons.${r}`) }))} onChange={(r) => f.setValue("reason", r, { shouldValidate: true })} />
      <FormInput control={f.control} name="note" label={t("sl9.noteLabel")} multiline maxLength={500} />
    </FormSheet>
  );
}
