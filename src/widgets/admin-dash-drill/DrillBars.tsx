import { StyleSheet, View } from "react-native";
import type { DrillRow } from "@/entities/admin-dash";
import { Text } from "@/shared/ui";
import { ProgressBar } from "@/shared/ui/admin";

// Share rows: label, formatted value, % of the total and a bar scaled to the largest row.
export function DrillBars({ rows }: { rows: DrillRow[] }) {
  const max = Math.max(1, ...rows.map((r) => r.n ?? 0));
  const total = rows.reduce((a, r) => a + (r.n ?? 0), 0);
  return (
    <View style={s.col}>
      {rows.map((r, i) => (
        <View key={`${r.label}-${i}`} style={s.item}>
          <View style={s.head}>
            <Text variant="small" weight="semibold" numberOfLines={1} style={s.label}>{r.label}</Text>
            <Text variant="small" weight="bold">{r.value}{total > 0 && r.n != null ? `  ·  ${Math.round((r.n / total) * 100)}%` : ""}</Text>
          </View>
          <ProgressBar value={(r.n ?? 0) / max} />
          {r.sub ? <Text variant="caption" tone="gray2">{r.sub}</Text> : null}
        </View>
      ))}
    </View>
  );
}

const s = StyleSheet.create({ col: { gap: 12 }, item: { gap: 5 }, head: { flexDirection: "row", justifyContent: "space-between", gap: 10 }, label: { flex: 1 } });
