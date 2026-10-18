import { StyleSheet, View } from "react-native";
import type { DrillRow } from "@/entities/admin-dash";
import { Pill, Text, type PillTone } from "@/shared/ui";
import { useColors } from "@/shared/theme";

const TONE: Record<string, PillTone> = { ok: "ok", bad: "err", muted: "gray" };

// Plain record rows: title + detail line on the left, the value as a pill on the right.
export function DrillList({ rows }: { rows: DrillRow[] }) {
  const c = useColors();
  return (
    <View style={[s.box, { borderColor: c.line }]}>
      {rows.map((r, i) => (
        <View key={`${r.label}-${i}`} style={[s.row, i > 0 && { borderTopWidth: 1, borderTopColor: c.line }]}>
          <View style={s.col}>
            <Text variant="small" weight="bold" numberOfLines={2}>{r.label}</Text>
            {r.sub ? <Text variant="caption" tone="gray" numberOfLines={3}>{r.sub}</Text> : null}
          </View>
          {r.value ? <Pill label={r.value} tone={r.tone ? TONE[r.tone] : "blue"} small /> : null}
        </View>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  box: { borderWidth: 1, borderRadius: 16, overflow: "hidden" },
  row: { flexDirection: "row", alignItems: "center", gap: 10, padding: 12 },
  col: { flex: 1, gap: 2 },
});
