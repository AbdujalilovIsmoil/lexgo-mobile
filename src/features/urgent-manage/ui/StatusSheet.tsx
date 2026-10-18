import { statusChoices, useClaim, useSetStatus, useUrgentLabels, type UrgentRequest } from "@/entities/urgent";
import { FormSheet, SelectField } from "@/shared/ui/admin";
import { toast } from "@/shared/ui";
import { FormInput, useAppForm, useFieldError } from "@/shared/form";
import { useSheetReset } from "@/shared/lib/useSheetReset";
import { useT } from "@/shared/i18n";
import { statusSchema } from "./statusSchema";

type Props = { req: UrgentRequest; meId: string; visible: boolean; onClose: () => void };

// Move the record by hand, but only to a status its own lifecycle allows (completed / cancelled have their own forms).
export function StatusSheet({ req, meId, visible, onClose }: Props) {
  const { t } = useT();
  const label = useUrgentLabels();
  const tr = useFieldError();
  const f = useAppForm(statusSchema, { to: "", note: "" });
  const to = f.watch("to");
  const move = useSetStatus();
  const claim = useClaim(() => toast(t("ug10.taken"), "err"));
  const choices = statusChoices(req, meId);
  useSheetReset(visible, () => f.reset({ to: "", note: "" }));
  const done = { onSuccess: onClose };
  const submit = f.handleSubmit((v) => (v.to === "claimed" ? claim.mutate(req.id, done) : move.mutate({ id: req.id, status: v.to, note: v.note }, done)));
  return (
    <FormSheet visible={visible} onClose={onClose} title={t("ug8.moveTo")} onSubmit={() => void submit()} submitLabel={t("ug8.move")} submitting={move.isPending || claim.isPending} snaps={[0.62, 0.92]}>
      <SelectField label={t("adm.status")} value={to} onChange={(v) => f.setValue("to", v, { shouldValidate: true })} error={tr(f.formState.errors.to?.message)} options={choices.map((s) => ({ value: s, label: label.status(s) }))} />
      <FormInput control={f.control} name="note" label={t("adm.note")} placeholder={t("ug8.notePh")} editable={to !== "claimed"} />
    </FormSheet>
  );
}
