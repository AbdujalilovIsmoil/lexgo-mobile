import type { Position } from "@/entities/admin-hrm";
import { FormSheet, SelectField } from "@/shared/ui/admin";
import { FormInput, useAppForm } from "@/shared/form";
import { useT } from "@/shared/i18n";
import { positionSchema } from "../model/peopleSchemas";
import { useSavePosition } from "../model/usePeopleActions";

// Add or edit a job position: title, code, category, grade, description and status.
export function PositionForm({ visible, onClose, position }: { visible: boolean; onClose: () => void; position: Position | null }) {
  const { t } = useT();
  const f = useAppForm(positionSchema, { title: position?.title ?? "", code: position?.code ?? "", category: position?.category ?? "", grade: position?.grade ?? "", description: position?.description ?? "", status: position?.status ?? "active" });
  const save = useSavePosition();
  const submit = f.handleSubmit((v) => save.mutate({ base: position, input: v }, { onSuccess: () => { onClose(); if (!position) f.reset(); } }));
  return (
    <FormSheet visible={visible} onClose={onClose} title={t(position ? "admHrmB.editPosition" : "admHrmB.newPosition")} onSubmit={() => void submit()} submitting={save.isPending}>
      <FormInput control={f.control} name="title" label={t("admHrmB.positionName")} autoCapitalize="sentences" />
      <FormInput control={f.control} name="code" label={t("admHrmB.code")} autoCapitalize="characters" autoCorrect={false} />
      <FormInput control={f.control} name="category" label={t("admHrmB.category")} autoCapitalize="none" />
      <FormInput control={f.control} name="grade" label={t("admHrmB.grade")} />
      <FormInput control={f.control} name="description" label={t("adm.description")} multiline />
      <SelectField label={t("adm.status")} value={f.watch("status")} onChange={(x) => f.setValue("status", x)} options={[{ value: "active", label: t("adm.active") }, { value: "inactive", label: t("adm.inactive") }]} />
    </FormSheet>
  );
}
