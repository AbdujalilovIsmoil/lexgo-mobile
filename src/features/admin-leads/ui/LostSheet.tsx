import { FormInput, useAppForm } from "@/shared/form";
import { FormSheet, SelectField } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";
import type { LostAsk } from "../model/useMoveFlow";
import { lostSchema } from "../model/leadSchemas";

const REASONS = ["price", "solved_self", "competitor", "no_answer", "no_service", "spam"];

// Why a lead is closed as lost (required by the sales team's statistics).
export function LostSheet({ ask, onCancel, onConfirm }: { ask: LostAsk | null; onCancel: () => void; onConfirm: (reason: string, note: string) => void }) {
  const { t } = useT();
  const f = useAppForm(lostSchema, { reason: "price", note: "" });
  const submit = f.handleSubmit((v) => {
    onConfirm(v.reason, v.note);
    f.resetField("note");
  });
  return (
    <FormSheet visible={!!ask} onClose={onCancel} title={t("admLeadsC.lostTitle")} subtitle={t("admLeadsC.lostText")} onSubmit={() => void submit()} submitLabel={t("admLeadsC.lostConfirm")} snaps={[0.62, 0.94]}>
      <SelectField label={t("adm.reason")} value={f.watch("reason")} options={REASONS.map((r) => ({ value: r, label: t(`admLeadsB.lost.${r}`) }))} onChange={(x) => f.setValue("reason", x)} />
      <FormInput control={f.control} name="note" label={t("admLeadsC.lostNote")} multiline />
    </FormSheet>
  );
}
