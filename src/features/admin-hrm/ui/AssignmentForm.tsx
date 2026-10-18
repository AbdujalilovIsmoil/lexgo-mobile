import { type Employee, EmployeeSelect, PositionSelect, UnitSelect } from "@/entities/admin-hrm";
import { FormSheet, SelectField } from "@/shared/ui/admin";
import { FormInput, useAppForm } from "@/shared/form";
import { useT } from "@/shared/i18n";
import { assignmentSchema } from "../model/peopleSchemas";
import { useAssignEmployee } from "../model/usePeopleActions";

const digits = (x: string) => x.replace(/\D/g, "");

// Put an employee into a unit and a position, with a manager and a monthly salary (POST /internal/employees/assignments).
export function AssignmentForm({ visible, onClose, employee }: { visible: boolean; onClose: () => void; employee: Employee }) {
  const { t } = useT();
  const a = employee.assignment;
  const f = useAppForm(assignmentSchema, { unitId: a?.unitId ?? "", positionId: a?.positionId ?? "", managerId: a?.managerId ?? "", salary: a?.salary ? String(a.salary) : "", kind: a?.employmentType ?? "full_time", rate: String(a?.rate ?? 100) });
  const save = useAssignEmployee();
  const [unitId, positionId, managerId, kind] = f.watch(["unitId", "positionId", "managerId", "kind"]);
  const submit = f.handleSubmit((v) =>
    save.mutate({ employee, input: { unitId: v.unitId, positionId: v.positionId, managerId: v.managerId, salary: Number(v.salary) || 0, employmentType: v.kind, rate: Math.min(200, Number(v.rate) || 100) } }, { onSuccess: onClose }));
  return (
    <FormSheet visible={visible} onClose={onClose} title={t("admHrmB.assignment")} subtitle={employee.name} onSubmit={() => void submit()} submitting={save.isPending}>
      <UnitSelect label={t("admHrmB.unit")} value={unitId} onChange={(x) => f.setValue("unitId", x)} none={t("admHrmB.notSet")} />
      <PositionSelect label={t("admHrmB.position")} value={positionId} onChange={(x) => f.setValue("positionId", x)} none={t("admHrmB.notSet")} />
      <EmployeeSelect label={t("admHrmB.manager")} value={managerId} onChange={(x) => f.setValue("managerId", x)} none={t("admHrmB.notSet")} />
      <SelectField label={t("ag8.emp.kind")} value={kind} onChange={(x) => f.setValue("kind", x)} options={["full_time", "part_time", "contract"].map((k) => ({ value: k, label: t(`ag8.emp.kinds.${k}`) }))} />
      <FormInput control={f.control} name="rate" label={t("ag8.emp.rate")} format={digits} keyboardType="number-pad" hint="%" />
      <FormInput control={f.control} name="salary" label={t("admHrmB.salary")} format={digits} keyboardType="number-pad" hint={t("adm.currency")} />
    </FormSheet>
  );
}
