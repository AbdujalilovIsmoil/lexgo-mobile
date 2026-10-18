import { View } from "react-native";
import { EmployeeSelect, KPI_SOURCES, kpiTint, lastMonths, monthOf, srcLabel } from "@/entities/admin-hrm";
import { FormSheet, ProgressBar, SelectField } from "@/shared/ui/admin";
import { FormInput, useAppForm } from "@/shared/form";
import { useT } from "@/shared/i18n";
import { kpiSchema } from "../model/workSchemas";
import { useCreateKpi } from "../model/useWorkActions";

const num = (s: string) => Number(s) || 0; // the API takes whole numbers for target, actual and weight
const digits = (x: string) => x.replace(/[^\d]/g, "");
const BLANK = { employeeId: "", period: monthOf(), title: "", target: "", actual: "", weight: "100", source: "manual" };

// New KPI metric for an employee and a month; the server computes the score from actual / target.
export function KpiForm({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { t } = useT();
  const f = useAppForm(kpiSchema, BLANK);
  const save = useCreateKpi();
  const [employeeId, period, source, target, actual] = f.watch(["employeeId", "period", "source", "target", "actual"]);
  const pct = num(target) ? num(actual) / num(target) : 0; // live preview of the score
  const months = lastMonths(12).map((m) => ({ value: m, label: m }));
  const numeric = (k: "target" | "actual" | "weight", label: string) => (
    <View style={{ flex: 1 }}><FormInput control={f.control} name={k} label={label} format={digits} keyboardType="number-pad" /></View>
  );
  const submit = f.handleSubmit((v) => save.mutate({ employeeId: v.employeeId, period: v.period, title: v.title, target: num(v.target), actual: num(v.actual), weight: num(v.weight), source: v.source }, { onSuccess: () => { onClose(); f.reset(); } }));
  return (
    <FormSheet visible={visible} onClose={onClose} title={t("admHrmC.newKpi")} onSubmit={() => void submit()} submitting={save.isPending} disabled={!employeeId}>
      <EmployeeSelect label={t("admHrmC.employee")} value={employeeId} onChange={(x) => f.setValue("employeeId", x)} />
      <SelectField label={t("adm.period")} value={period} onChange={(x) => f.setValue("period", x)} options={months} />
      <FormInput control={f.control} name="title" label={t("admHrmC.metric")} autoCapitalize="sentences" />
      <View style={{ flexDirection: "row", gap: 10 }}>{numeric("target", t("admHrmC.target"))}{numeric("actual", t("admHrmC.actual"))}{numeric("weight", t("admHrmC.weight"))}</View>
      <ProgressBar value={pct} color={kpiTint(pct * 100)} />
      <SelectField label={t("admHrmC.source")} value={source} onChange={(x) => f.setValue("source", x)} options={KPI_SOURCES.map((s) => ({ value: s, label: srcLabel(t, s) }))} />
    </FormSheet>
  );
}
