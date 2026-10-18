import { statusChoices, useCcLabel, useUrgentStatus, useClaimUrgent, type UrgentRequest } from "@/entities/admin-callcenter";
import { FormSheet, SelectField } from "@/shared/ui/admin";
import { FormInput, useAppForm } from "@/shared/form";
import { useT } from "@/shared/i18n";
import { statusSchema } from "../model/ccSchemas";

type Props = { req: UrgentRequest; meId: string; visible: boolean; onClose: () => void };

// Move the record by hand, but only to a status the record's own lifecycle allows.
// completed / cancelled have their own sheets (they need a result / a reason).
export function StatusSheet({ req, meId, visible, onClose }: Props) {
  const { t } = useT();
  const label = useCcLabel();
  const f = useAppForm(statusSchema, { to: "", note: "" });
  const move = useUrgentStatus();
  const claim = useClaimUrgent();
  const choices = statusChoices(req, meId);
  const to = f.watch("to");
  const done = { onSuccess: () => { f.reset(); onClose(); } };
  const submit = f.handleSubmit((v) => (v.to === "claimed" ? claim.mutate(req.id, done) : move.mutate({ id: req.id, status: v.to, note: v.note }, done)));
  return (
    <FormSheet visible={visible} onClose={onClose} title={t("admCcB.moveTo")} onSubmit={() => void submit()} submitLabel={t("admCcB.move")} submitting={move.isPending || claim.isPending} disabled={!choices.includes(to)} snaps={[0.62, 0.92]}>
      <SelectField label={t("adm.status")} value={to} onChange={(x) => f.setValue("to", x)} options={choices.map((s) => ({ value: s, label: label("admCc.stat", s) }))} />
      <FormInput control={f.control} name="note" label={t("adm.note")} placeholder={t("admCcB.statusNotePh")} editable={to !== "claimed"} />
    </FormSheet>
  );
}
