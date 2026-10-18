import { View } from "react-native";
import { useT } from "@/shared/i18n";
import { ChipBar } from "./ChipBar";
import { DateField } from "./DateField";
import type { DatePreset, DateRange } from "./useDateRange";

// Period chips (today / 7 / 30 / 90 days / all / custom); "custom" reveals two date fields.
export function DateRangeBar({ bar, withAll }: { bar: DateRange; withAll?: boolean }) {
  const { t } = useT();
  const options: { value: DatePreset; label: string }[] = [
    { value: "today", label: t("adm.today") },
    { value: "d7", label: t("adm.d7") },
    { value: "d30", label: t("adm.d30") },
    { value: "d90", label: t("adm.d90") },
    ...(withAll ? [{ value: "all" as const, label: t("adm.all") }] : []),
    { value: "custom", label: t("adm.custom") },
  ];
  return (
    <View style={{ gap: 10 }}>
      <ChipBar options={options} value={bar.preset} onChange={bar.setPreset} />
      {bar.preset === "custom" ? (
        <View style={{ flexDirection: "row", gap: 10, paddingHorizontal: 16 }}>
          <View style={{ flex: 1 }}><DateField label={t("adm.from")} value={bar.from} onChange={bar.setFrom} /></View>
          <View style={{ flex: 1 }}><DateField label={t("adm.to")} value={bar.to} onChange={bar.setTo} /></View>
        </View>
      ) : null}
    </View>
  );
}
