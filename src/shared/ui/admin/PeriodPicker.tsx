import { StyleSheet, View } from "react-native";
import { useT } from "@/shared/i18n";
import { SheetOption } from "../SheetOption";
import { Text } from "../Text";
import { RangeCalendar } from "./RangeCalendar";
import type { DatePreset, DateRange } from "./useDateRange";

const PERIODS: DatePreset[] = ["all", "today", "d7", "d30", "d90", "custom"];

// The "Period" group of a filter sheet: ready-made periods, and "custom" opens a calendar to pick the first and the last day.
export function PeriodPicker({ bar, label }: { bar: DateRange; label: string }) {
  const { t } = useT();
  return (
    <View style={s.group}>
      <Text variant="small" tone="gray">{label}</Text>
      {PERIODS.map((p) => <SheetOption key={p} on={bar.preset === p} label={t(`adm.${p}`)} onPress={() => bar.setPreset(p)} />)}
      {bar.preset === "custom" ? (
        <View style={s.cal}><RangeCalendar from={bar.from} to={bar.to} onChange={(f, e) => { bar.setFrom(f); bar.setTo(e); }} /></View>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({ group: { gap: 8, marginBottom: 20 }, cal: { marginTop: 10 } });
