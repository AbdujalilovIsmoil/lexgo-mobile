import { useMemo } from "react";
import { Platform, StyleSheet, View } from "react-native";
import type { CalEvent } from "@/entities/pro-calendar";
import { useT } from "@/shared/i18n";
import { monthCells, todayKey } from "@/shared/lib/pro/dates";
import { useTheme } from "@/shared/theme";
import { Icon, PressableScale, Text } from "@/shared/ui";

type Props = { year: number; month: number; selected: string; byDay: Map<string, CalEvent[]>; onSelect: (key: string) => void; onStep: (d: number) => void };

// The month as a white card (Adliya): "Noyabr 2026" with the previous / next arrows, the Monday-first weekday row in grey, the days in bold —
// the selected one on a solid blue rounded square, today in blue, a dot under a day that has events. Days of the neighbouring months are not
// drawn.
export function MonthGrid({ year, month, selected, byDay, onSelect, onStep }: Props) {
  const { colors: c, dark, glass } = useTheme();
  const { tList } = useT();
  const cells = useMemo(() => monthCells(year, month), [year, month]);
  const today = todayKey();
  return (
    <View style={[s.card, { backgroundColor: dark || glass ? c.surface : "#FFFFFF", borderColor: dark || glass ? c.line : "#E6EBF3" }, !glass && s.shadow]}>
      <View style={s.head}>
        <Text variant="h4" weight="bold" style={s.title}>{`${tList("aw11.months")[month] ?? ""} ${year}`}</Text>
        <PressableScale onPress={() => onStep(-1)} hitSlop={8} accessibilityRole="button" accessibilityLabel="‹" style={[s.nav, { backgroundColor: c.tint2 }]}><Icon name="chevron-left" size={18} color={c.accent} /></PressableScale>
        <PressableScale onPress={() => onStep(1)} hitSlop={8} accessibilityRole="button" accessibilityLabel="›" style={[s.nav, { backgroundColor: c.tint2 }]}><Icon name="chevron-right" size={18} color={c.accent} /></PressableScale>
      </View>
      <View style={s.grid}>
        {tList("aw11.weekdays").map((w) => (
          <Text key={w} variant="small" tone="gray" center weight="semibold" style={[s.cell, s.wd]}>{w}</Text>
        ))}
        {cells.map((cell) => {
          if (cell.other) return <View key={cell.key} style={s.cell} />;
          const evs = byDay.get(cell.key) ?? [];
          const on = cell.key === selected;
          const now = cell.key === today;
          return (
            <PressableScale key={cell.key} onPress={() => onSelect(cell.key)} scale={0.92} accessibilityRole="button" accessibilityState={{ selected: on }} style={s.cell}>
              <View style={[s.day, on && { backgroundColor: c.accent }]}>
                <Text variant="body" weight="bold" style={{ color: on ? "#FFFFFF" : now ? c.accent : c.ink }}>{cell.day}</Text>
                <View style={[s.dot, { backgroundColor: evs.length ? (on ? "#FFFFFF" : c.accent) : "transparent" }]} />
              </View>
            </PressableScale>
          );
        })}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  card: { padding: 16, paddingBottom: 10, borderRadius: 22, borderWidth: 1, gap: 10 },
  head: { flexDirection: "row", alignItems: "center", gap: 8 },
  title: { flex: 1, fontSize: 17, lineHeight: 22 },
  nav: { width: 32, height: 32, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  grid: { flexDirection: "row", flexWrap: "wrap" },
  cell: { width: "14.2857%", paddingVertical: 3, alignItems: "center" },
  wd: { paddingBottom: 6 },
  day: { width: 44, height: 46, borderRadius: 13, alignItems: "center", justifyContent: "center", gap: 3 },
  dot: { width: 5, height: 5, borderRadius: 3 },
  shadow: Platform.select({ ios: { shadowColor: "#0B1A33", shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } }, default: { elevation: 1 } })!,
});
