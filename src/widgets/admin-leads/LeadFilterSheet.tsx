import { useState } from "react";
import { View } from "react-native";
import { DateRangeBar, FormSheet, SelectField, isDate, useDateRange, useFormState } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";
import { distinct, regionLabel, scoreLabel, sourceLabel, urgencyLabel, type Lead, type LeadFilter, type Operator } from "@/entities/admin-leads";

type Props = { visible: boolean; onClose: () => void; value: LeadFilter; onApply: (f: LeadFilter) => void; leads: Lead[]; ops: Operator[] };

// Region, source, score, urgency, operator and creation period. Applied together with the button.
export function LeadFilterSheet({ visible, onClose, value, onApply, leads, ops }: Props) {
  const { t } = useT();
  const { values: d, set, setAll } = useFormState(value);
  const bar = useDateRange("all");
  const [seen, setSeen] = useState(visible);
  if (visible !== seen) {
    setSeen(visible);
    if (visible) {
      setAll(value);
      bar.setPreset(value.from || value.to ? "custom" : "all");
      bar.setFrom(value.from);
      bar.setTo(value.to);
    }
  }
  const all = { value: "", label: t("adm.all") };
  const of = (pick: (l: Lead) => string, label: (v: string) => string) => {
    const vals = distinct(leads, pick);
    return vals.length ? [all, ...vals.map((v) => ({ value: v, label: label(v) }))] : [];
  };
  const apply = () => { onApply({ ...d, from: isDate(bar.range.from) ? bar.range.from : "", to: isDate(bar.range.to) ? bar.range.to : "" }); onClose(); };
  const reset = () => { setAll({ ...d, region: "", source: "", score: "", urgency: "", assignee: "" }); bar.setPreset("all"); };
  const field = (key: "region" | "source" | "urgency", label: string, options: { value: string; label: string }[]) =>
    options.length ? <SelectField label={label} value={d[key]} options={options} onChange={(v) => set(key, v)} /> : null;
  const people = [all, { value: "mine", label: t("admLeads.mine") }, { value: "unassigned", label: t("admLeads.unassigned") }, ...ops.map((o) => ({ value: o.id, label: o.name || o.phone || o.lexgoId }))];
  return (
    <FormSheet visible={visible} onClose={onClose} title={t("adm.filters")} onSubmit={apply} submitLabel={t("adm.apply")} secondary={{ label: t("adm.reset"), onPress: reset }}>
      <SelectField label={t("admLeads.operator")} value={d.assignee} options={people} onChange={(v) => set("assignee", v)} />
      <SelectField label={t("admLeads.score")} value={d.score} options={[all, ...["hot", "warm", "cold"].map((s) => ({ value: s, label: scoreLabel(t, s) }))]} onChange={(v) => set("score", v)} />
      {field("region", t("admLeads.region"), of((l) => l.region, (v) => regionLabel(t, v)))}
      {field("source", t("admLeads.source"), of((l) => l.source, (v) => sourceLabel(t, v)))}
      {field("urgency", t("admLeads.urgency"), of((l) => l.urgency, (v) => urgencyLabel(t, v)))}
      <View style={{ marginHorizontal: -16 }}><DateRangeBar bar={bar} withAll /></View>
    </FormSheet>
  );
}
