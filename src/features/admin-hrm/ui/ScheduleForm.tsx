import { EmployeeSelect, UnitSelect, WEEK_DAYS, isTime } from "@/entities/admin-hrm";
import { FormSheet } from "@/shared/ui/admin";
import { FormInput, useAppForm } from "@/shared/form";
import { useT } from "@/shared/i18n";
import { scheduleSchema } from "../model/workSchemas";
import { useCreateSchedule } from "../model/useWorkActions";
import { defaultDays, ScheduleDays } from "./ScheduleDays";

// New weekly work schedule for one employee, a unit or (with neither chosen) everyone.
export function ScheduleForm({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { t } = useT();
  const f = useAppForm(scheduleSchema, { title: "", employeeId: "", unitId: "", days: defaultDays() });
  const save = useCreateSchedule();
  const [employeeId, unitId, days] = f.watch(["employeeId", "unitId", "days"]);
  const weekly = WEEK_DAYS.map((day, i) => ({ day, ...days[i] })).filter((d) => d.on).map(({ day, start, end }) => ({ day, start, end }));
  // The weekly editor is not a text field: the sheet stays disabled until a day is on and every time is valid.
  const bad = !weekly.length || weekly.some((d) => !isTime(d.start) || !isTime(d.end));
  const submit = f.handleSubmit((v) => save.mutate({ title: v.title, employeeId: v.employeeId, unitId: v.unitId, weekly }, { onSuccess: () => { onClose(); f.reset(); } }));
  return (
    <FormSheet visible={visible} onClose={onClose} title={t("admHrmC.newSchedule")} onSubmit={() => void submit()} submitting={save.isPending} disabled={bad} snaps={[0.8, 0.95]}>
      <FormInput control={f.control} name="title" label={t("adm.name")} autoCapitalize="sentences" />
      <EmployeeSelect label={t("admHrmC.employee")} value={employeeId} onChange={(x) => f.setValue("employeeId", x)} none={t("admHrmC.anyone")} />
      <UnitSelect label={t("admHrmB.unit")} value={unitId} onChange={(x) => f.setValue("unitId", x)} none={t("admHrmC.anyone")} />
      <ScheduleDays days={days} onChange={(d) => f.setValue("days", d)} />
    </FormSheet>
  );
}
