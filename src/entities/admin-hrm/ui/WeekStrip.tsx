import { StyleSheet, View } from "react-native";
import { Text } from "@/shared/ui";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { WEEK_DAYS } from "../model/constants";
import { dayKey } from "../lib/format";
import type { WeekDay } from "../model/typesOps";

// Mon-Sun strip: working days are filled with the tint, days off stay hollow.
export function WeekStrip({ weekly, tint }: { weekly: WeekDay[]; tint: string }) {
  const { t } = useT();
  const c = useColors();
  const on = new Set(weekly.map((w) => dayKey(w.day)));
  return (
    <View style={s.row}>
      {WEEK_DAYS.map((d) => (
        <View key={d} style={[s.cell, on.has(d) ? { backgroundColor: tint } : { backgroundColor: c.surface2 }]}>
          <Text variant="caption" weight="bold" style={{ fontSize: 10, color: on.has(d) ? "#fff" : c.gray2 }}>{t(`admHrmC.dayShort.${d}`).slice(0, 2)}</Text>
        </View>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", gap: 4 },
  cell: { width: 26, height: 26, borderRadius: 9, alignItems: "center", justifyContent: "center" },
});
