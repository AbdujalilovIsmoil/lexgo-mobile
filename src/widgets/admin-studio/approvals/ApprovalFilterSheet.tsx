import { useState } from "react";
import { FormSheet, SelectField } from "@/shared/ui/admin";
import { useStudioText } from "@/entities/admin-studio";
import { useT } from "@/shared/i18n";
import { QUEUE_STATUSES } from "./helpers";

export type QueueFilter = { group: string; code: string; status: string };
type Opt = { value: string; label: string };
type Props = { visible: boolean; onClose: () => void; value: QueueFilter; onApply: (f: QueueFilter) => void; groups: Opt[]; codes: (Opt & { group: string })[] };

// Section, constructor and status of the queue in one bottom sheet; the constructors follow the chosen section. Nothing changes until
// "Apply"; "Reset" empties all three.
export function ApprovalFilterSheet({ visible, onClose, value, onApply, groups, codes }: Props) {
  const { t } = useT();
  const { status: label } = useStudioText();
  const [d, setD] = useState(value);
  const [seen, setSeen] = useState(visible);
  if (visible !== seen) {
    setSeen(visible);
    if (visible) setD(value);
  }
  const all = { value: "", label: t("admStudioD.appr.all") };
  const ctors = [all, ...codes.filter((c) => !d.group || c.group === d.group)];
  const set = (k: keyof QueueFilter, v: string) => setD((x) => ({ ...x, [k]: v, ...(k === "group" ? { code: "" } : {}) }));
  return (
    <FormSheet visible={visible} onClose={onClose} title={t("admStudioD.appr.filters")} onSubmit={() => { onApply(d); onClose(); }} submitLabel={t("admStudioD.appr.apply")} secondary={{ label: t("admStudioD.appr.reset"), onPress: () => setD({ group: "", code: "", status: "" }) }}>
      <SelectField label={t("admStudioD.appr.group")} value={d.group} options={[all, ...groups]} onChange={(v) => set("group", v)} />
      <SelectField label={t("admStudioD.appr.ctor")} value={d.code} options={ctors} onChange={(v) => set("code", v)} searchable />
      <SelectField label={t("admStudioD.appr.status")} value={d.status} options={[all, ...QUEUE_STATUSES.map((s) => ({ value: s as string, label: label(s) }))]} onChange={(v) => set("status", v)} />
    </FormSheet>
  );
}
