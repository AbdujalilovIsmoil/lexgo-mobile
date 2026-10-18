import { type Employee, PositionSelect, UnitSelect } from "@/entities/admin-hrm";
import { UserPickerSheet } from "@/features/admin-user-picker";
import { maskDate, FormSheet, SelectField } from "@/shared/ui/admin";
import { Button } from "@/shared/ui";
import { FormInput, useAppForm } from "@/shared/form";
import { useState } from "react";
import { useT } from "@/shared/i18n";
import { employeeSchema } from "../model/peopleSchemas";
import { useSaveEmployee } from "../model/usePeopleActions";

// Create an employee (optionally placed into a unit / position, like the web) or edit one's profile and status.
export function EmployeeForm({ visible, onClose, employee }: { visible: boolean; onClose: () => void; employee: Employee | null }) {
  const { t } = useT();
  const f = useAppForm(employeeSchema, {
    firstName: employee?.firstName ?? "", lastName: employee?.lastName ?? "", phone: employee?.phone ?? "", email: employee?.email ?? "",
    region: employee?.region ?? "", status: employee?.status ?? "active", unitId: "", positionId: "", hireDate: (employee?.hireDate ?? "").slice(0, 10),
    userId: employee?.userId ?? "", userName: employee?.userId ? t("ag8.emp.linked") : "",
  });
  const [pick, setPick] = useState(false);
  const save = useSaveEmployee();
  const [status, unitId, positionId, userId, userName] = f.watch(["status", "unitId", "positionId", "userId", "userName"]);
  const submit = f.handleSubmit((v) =>
    save.mutate(
      { base: employee, input: { firstName: v.firstName, lastName: v.lastName, phone: v.phone, email: v.email, region: v.region, status: v.status, userId: v.userId, hireDate: v.hireDate }, assign: { unitId: v.unitId, positionId: v.positionId, managerId: "", salary: 0 } },
      { onSuccess: () => { onClose(); if (!employee) f.reset(); } },
    ));
  const text = (name: "firstName" | "lastName" | "phone" | "email" | "region", label: string, extra: object = {}) => <FormInput control={f.control} name={name} label={label} autoCorrect={false} {...extra} />;
  return (
    <FormSheet visible={visible} onClose={onClose} title={t(employee ? "admHrmB.editEmployee" : "admHrmB.newEmployee")} onSubmit={() => void submit()} submitting={save.isPending}>
      {text("firstName", t("admHrmB.firstName"), { autoCapitalize: "words" })}
      {text("lastName", t("admHrmB.lastName"), { autoCapitalize: "words" })}
      {text("phone", t("adm.phone"), { keyboardType: "phone-pad" })}
      {text("email", "Email", { keyboardType: "email-address", autoCapitalize: "none" })}
      {text("region", t("admHrmB.region"), { autoCapitalize: "words" })}
      <FormInput control={f.control} name="hireDate" label={t("admHrm.hired")} format={maskDate} placeholder="2026-10-31" keyboardType="number-pad" maxLength={10} />
      <Button title={userId ? `${t("ag8.emp.account")}: ${userName}` : t("ag8.emp.link")} icon={userId ? "link" : "user-plus"} variant="soft" onPress={() => setPick(true)} />
      {userId ? <Button title={t("ag8.emp.unlink")} icon="x" variant="ghost" size="sm" onPress={() => { f.setValue("userId", ""); f.setValue("userName", ""); }} /> : null}
      {employee ? (
        <SelectField label={t("adm.status")} value={status} onChange={(x) => f.setValue("status", x)} options={[{ value: "active", label: t("adm.active") }, { value: "inactive", label: t("adm.inactive") }]} />
      ) : (
        <>
          <UnitSelect label={t("admHrmB.unit")} value={unitId} onChange={(x) => f.setValue("unitId", x)} none={t("admHrmB.notSet")} />
          <PositionSelect label={t("admHrmB.position")} value={positionId} onChange={(x) => f.setValue("positionId", x)} none={t("admHrmB.notSet")} />
        </>
      )}
      <UserPickerSheet visible={pick} onClose={() => setPick(false)} title={t("ag8.emp.link")} onPick={(u) => { f.setValue("userId", u.id); f.setValue("userName", u.name || u.phone); }} />
    </FormSheet>
  );
}
