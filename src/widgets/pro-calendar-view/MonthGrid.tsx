import { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { tintOf, type CalEvent } from "@/entities/pro-calendar";
import { useT } from "@/shared/i18n";
import { monthCells, todayKey } from "@/shared/lib/pro/dates";
import { useColors } from "@/shared/theme";
import { PressableScale, Text } from "@/shared/ui";

type Props = { year: number; month: number; selected: string; byDay: Map<string, CalEvent[]>; onSelect: (key: string) => void };

// Monday-first month grid: today ringed, selected day filled, up to three coloured dots per day.
export function MonthGrid({ year, month, selected, byDay, onSelect }: Props) {
  const c = useColors();
  const { tList } = useT();
  const cells = useMemo(() => monthCells(year, month), [year, month]);
  const today = todayKey();
  return (
    <View style={[s.card, { backgroundColor: c.surface, borderColor: c.line }]}>
    <View style={s.grid}>
      {tList("aw11.weekdays").map((w, i) => (
        <Text key={w} variant="caption" tone={i >= 5 ? "err" : "gray"} center weight="semibold" style={s.cell}>{w}</Text>
      ))}
      {cells.map((cell) => {
        const evs = byDay.get(cell.key) ?? [];
        const on = cell.key === selected;
        return (
          <PressableScale key={cell.key} onPress={() => onSelect(cell.key)} scale={0.92} style={s.cell}>
            <View style={[s.day, on && { backgroundColor: c.accent }, !on && evs.length > 0 && { backgroundColor: c.tint }, !on && cell.key === today && { borderColor: c.accent, borderWidth: 1.5 }]}>
              <Text variant="small" weight="semibold" style={{ color: on ? "#fff" : cell.other ? c.gray2 : c.ink }}>{cell.day}</Text>
              <View style={s.dots}>
                {evs.slice(0, 3).map((e) => <View key={e.id} style={[s.dot, { backgroundColor: on ? "#fff" : tintOf(e.type) }]} />)}
              </View>
            </View>
          </PressableScale>
        );
      })}
    </View>
    </View>
  );
}

const s = StyleSheet.create({
  card: { padding: 8, borderRadius: 20, borderWidth: 1 },
  grid: { flexDirection: "row", flexWrap: "wrap" },
  cell: { width: "14.2857%", paddingVertical: 2 },
  day: { height: 46, borderRadius: 14, alignItems: "center", justifyContent: "center", gap: 3 },
  dots: { flexDirection: "row", gap: 3, height: 6 },
  dot: { width: 5, height: 5, borderRadius: 3 },
});
