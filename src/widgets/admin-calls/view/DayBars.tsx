import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { PressableScale, Text } from "@/shared/ui";
import { SectionCard } from "@/shared/ui/admin";
import { selectHaptic } from "@/shared/lib/haptics";
import { useColors } from "@/shared/theme";
import type { Point } from "@/entities/admin-dash";

const MAX_DAYS = 14;

// Calls per day as tappable bars (the last two weeks of the chosen period); the tapped bar's day and count are shown on top.
export function DayBars({ title, points, empty }: { title: string; points: Point[]; empty: string }) {
  const c = useColors();
  const days = points.slice(-MAX_DAYS);
  const [sel, setSel] = useState<number | null>(null);
  const top = Math.max(1, ...days.map((p) => p.value));
  const at = sel ?? days.length - 1;
  const cur = days[at];
  if (!days.length) return <SectionCard title={title}><Text variant="small" tone="gray">{empty}</Text></SectionCard>;
  return (
    <SectionCard title={title}>
      <View style={s.head}>
        <Text variant="h2">{cur?.value ?? 0}</Text>
        <Text variant="caption" tone="gray">{cur?.label.slice(0, 10)}</Text>
      </View>
      <View style={s.row}>
        {days.map((p, i) => (
          <PressableScale key={`${p.label}-${i}`} onPress={() => { selectHaptic(); setSel(i); }} scale={0.9} style={s.cell} accessibilityRole="button">
            <View style={[s.bar, { height: Math.max(6, (p.value / top) * 96), backgroundColor: i === at ? c.accent : c.tint2 }]} />
          </PressableScale>
        ))}
      </View>
      <View style={s.axis}><Text variant="caption" tone="gray2">{days[0].label.slice(5, 10)}</Text><Text variant="caption" tone="gray2">{days[days.length - 1].label.slice(5, 10)}</Text></View>
    </SectionCard>
  );
}

const s = StyleSheet.create({
  head: { flexDirection: "row", alignItems: "baseline", gap: 10, marginBottom: 10 },
  row: { flexDirection: "row", alignItems: "flex-end", gap: 4, height: 100 },
  cell: { flex: 1, height: 100, justifyContent: "flex-end" },
  bar: { borderRadius: 6 },
  axis: { flexDirection: "row", justifyContent: "space-between", marginTop: 6 },
});
