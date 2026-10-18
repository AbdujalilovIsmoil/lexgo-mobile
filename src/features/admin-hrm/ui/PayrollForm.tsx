import { ENTRY_TYPES, EmployeeSelect, PAY_COLOR, entryLabel, lastMonths, monthOf, payGroup } from "@/entities/admin-hrm";
import { FormSheet, SelectField } from "@/shared/ui/admin";
import { Text } from "@/shared/ui";
import { FormInput, useAppForm } from "@/shared/form";
import { fmtMoney } from "@/shared/lib/money";
import { useT } from "@/shared/i18n";
import { payrollSchema } from "../model/workSchemas";
import { useCreatePayroll } from "../model/useWorkActions";

const BLANK = { employeeId: "", period: monthOf(), type: "salary", amount: "", title: "" };

// New payroll entry (saved as a draft): employee, month, entry type, amount in so'm and an optional note.
export function PayrollForm({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { t } = useT();
  const f = useAppForm(payrollSchema, BLANK);
  const save = useCreatePayroll();
  const [employeeId, period, type, raw] = f.watch(["employeeId", "period", "type", "amount"]);
  const amount = Number(raw) || 0;
  const submit = f.handleSubmit((v) => save.mutate({ employeeId: v.employeeId, period: v.period, type: v.type, amount: Number(v.amount) || 0, title: v.title }, { onSuccess: () => { onClose(); f.reset(); } }));
  return (
    <FormSheet visible={visible} onClose={onClose} title={t("admHrmC.newEntry")} onSubmit={() => void submit()} submitting={save.isPending} disabled={!employeeId}>
      <EmployeeSelect label={t("admHrmC.employee")} value={employeeId} onChange={(x) => f.setValue("employeeId", x)} />
      <SelectField label={t("adm.period")} value={period} onChange={(x) => f.setValue("period", x)} options={lastMonths(12).map((m) => ({ value: m, label: m }))} />
      <SelectField label={t("admHrmC.entryType")} value={type} onChange={(x) => f.setValue("type", x)} options={ENTRY_TYPES.map((e) => ({ value: e, label: entryLabel(t, e) }))} />
      <Text variant="h2" center style={{ color: PAY_COLOR[payGroup(type)] }}>{fmtMoney(amount)} {t("adm.currency")}</Text>
      <FormInput control={f.control} name="amount" label={t("adm.amount")} format={(x) => x.replace(/[^\d.]/g, "")} keyboardType="decimal-pad" hint={t("adm.currency")} />
      <FormInput control={f.control} name="title" label={t("adm.note")} maxLength={300} />
    </FormSheet>
  );
}
