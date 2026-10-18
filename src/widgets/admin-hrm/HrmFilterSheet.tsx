import { View } from "react-native";
import { EmployeeSelect, PositionSelect, UnitSelect, lastMonths } from "@/entities/admin-hrm";
import { DateField, FormSheet, SelectField } from "@/shared/ui/admin";
import { Input } from "@/shared/ui";
import { useT } from "@/shared/i18n";

export type HrmFilters = { employeeId: string; unitId: string; project: string; from: string; to: string; period: string; positionId: string };
export type FilterField = "employee" | "unit" | "project" | "dates" | "period" | "position";
export const NO_FILTERS: HrmFilters = { employeeId: "", unitId: "", project: "", from: "", to: "", period: "", positionId: "" };
export const countFilters = (f: HrmFilters): number => Object.values(f).filter(Boolean).length;

type Props = { visible: boolean; onClose: () => void; value: HrmFilters; onChange: (f: HrmFilters) => void; fields: FilterField[] };

// Filters of a list, applied live as they change; "Reset" clears them all.
export function HrmFilterSheet({ visible, onClose, value, onChange, fields }: Props) {
  const { t } = useT();
  const set = (k: keyof HrmFilters) => (v: string) => onChange({ ...value, [k]: v });
  const has = (f: FilterField) => fields.includes(f);
  return (
    <FormSheet visible={visible} onClose={onClose} title={t("adm.filters")} onSubmit={onClose} submitLabel={t("adm.done")} secondary={{ label: t("adm.reset"), onPress: () => onChange(NO_FILTERS) }}>
      {has("employee") ? <EmployeeSelect label={t("admHrmC.employee")} value={value.employeeId} onChange={set("employeeId")} none={t("adm.all")} /> : null}
      {has("unit") ? <UnitSelect label={t("admHrmB.unit")} value={value.unitId} onChange={set("unitId")} none={t("adm.all")} /> : null}
      {has("position") ? <PositionSelect label={t("admHrmB.position")} value={value.positionId} onChange={set("positionId")} none={t("adm.all")} /> : null}
      {has("project") ? <Input label={t("admHrmC.project")} value={value.project} onChangeText={set("project")} autoCapitalize="none" autoCorrect={false} /> : null}
      {has("period") ? <SelectField label={t("adm.period")} value={value.period} onChange={set("period")} options={[{ value: "", label: t("adm.all") }, ...lastMonths(12).map((m) => ({ value: m, label: m }))]} /> : null}
      {has("dates") ? (
        <View style={{ flexDirection: "row", gap: 10 }}>
          <View style={{ flex: 1 }}><DateField label={t("adm.from")} value={value.from} onChange={set("from")} /></View>
          <View style={{ flex: 1 }}><DateField label={t("adm.to")} value={value.to} onChange={set("to")} /></View>
        </View>
      ) : null}
    </FormSheet>
  );
}
