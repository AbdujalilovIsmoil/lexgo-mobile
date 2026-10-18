import { EMPTY_FILTER, type LeadFilter, type Operator } from "@/entities/admin-callcenter";
import { DateField, FormSheet, SelectField } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";

type Props = { visible: boolean; onClose: () => void; value: LeadFilter; onChange: (f: LeadFilter) => void; regions: { value: string; label: string }[]; operators: Operator[] };

// Board filters: region, score, assignee ("mine" / unassigned / an operator) and a created-day range.
export function LeadFilterSheet({ visible, onClose, value: v, onChange, regions, operators }: Props) {
  const { t } = useT();
  const set = (patch: Partial<LeadFilter>) => onChange({ ...v, ...patch });
  const who = [{ value: "", label: t("adm.all") }, { value: "mine", label: t("admCcB.mine") }, { value: "unassigned", label: t("admCcB.unassigned") }, ...operators.map((o) => ({ value: o.id, label: o.name || o.phone }))];
  return (
    <FormSheet visible={visible} onClose={onClose} title={t("adm.filters")} onSubmit={onClose} submitLabel={t("adm.apply")} secondary={{ label: t("adm.reset"), onPress: () => { onChange({ ...EMPTY_FILTER, q: v.q }); onClose(); } }} snaps={[0.7, 0.94]}>
      <SelectField label={t("admCc.fRegion")} value={v.region} onChange={(x) => set({ region: x })} options={[{ value: "", label: t("adm.all") }, ...regions]} />
      <SelectField label={t("admCcB.fScore")} value={v.score} onChange={(x) => set({ score: x })} options={[{ value: "", label: t("adm.all") }, ...["hot", "warm", "cold"].map((s) => ({ value: s, label: t(`admCc.score.${s}`) }))]} />
      <SelectField label={t("adm.assignee")} value={v.assignee} onChange={(x) => set({ assignee: x })} options={who} />
      <DateField label={t("adm.from")} value={v.from} onChange={(x) => set({ from: x })} />
      <DateField label={t("adm.to")} value={v.to} onChange={(x) => set({ to: x })} />
    </FormSheet>
  );
}
