import { PRIORITIES, EmployeeSelect, UnitSelect, prioLabel } from "@/entities/admin-hrm";
import { maskDate, FormSheet, SelectField } from "@/shared/ui/admin";
import { FormInput, useAppForm } from "@/shared/form";
import { useT } from "@/shared/i18n";
import { taskSchema } from "../model/workSchemas";
import { useCreateTask } from "../model/useWorkActions";

const BLANK = { title: "", description: "", project: "", employeeId: "", unitId: "", priority: "normal", deadline: "" };

// New execution task: title, description, project, assignee, unit, priority and deadline.
export function TaskForm({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { t } = useT();
  const f = useAppForm(taskSchema, BLANK);
  const save = useCreateTask();
  const [employeeId, unitId, priority] = f.watch(["employeeId", "unitId", "priority"]);
  const submit = f.handleSubmit((v) => save.mutate(v, { onSuccess: () => { onClose(); f.reset(); } }));
  return (
    <FormSheet visible={visible} onClose={onClose} title={t("admHrmC.newTask")} onSubmit={() => void submit()} submitting={save.isPending}>
      <FormInput control={f.control} name="title" label={t("adm.title")} autoCapitalize="sentences" />
      <FormInput control={f.control} name="description" label={t("adm.description")} multiline autoCapitalize="sentences" />
      <FormInput control={f.control} name="project" label={t("admHrmC.project")} placeholder="internal" autoCapitalize="none" />
      <EmployeeSelect label={t("adm.assignee")} value={employeeId} onChange={(x) => f.setValue("employeeId", x)} none={t("admHrmB.notSet")} />
      <UnitSelect label={t("admHrmB.unit")} value={unitId} onChange={(x) => f.setValue("unitId", x)} none={t("admHrmB.notSet")} />
      <SelectField label={t("admHrmC.priority")} value={priority} onChange={(x) => f.setValue("priority", x)} options={PRIORITIES.map((p) => ({ value: p, label: prioLabel(t, p) }))} />
      <FormInput control={f.control} name="deadline" label={t("admHrmC.deadline")} format={maskDate} placeholder="2026-10-31" keyboardType="number-pad" maxLength={10} />
    </FormSheet>
  );
}
