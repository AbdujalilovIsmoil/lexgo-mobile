import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { useColors } from "@/shared/theme";
import { Text } from "../Text";

export type Fact = { label: string; value?: ReactNode };

// Key facts as hairline rows (label left, value right). Rows without a value are skipped.
export function FactRows({ rows }: { rows: Fact[] }) {
  const c = useColors();
  const shown = rows.filter((r) => r.value !== undefined && r.value !== null && r.value !== "");
  if (!shown.length) return null;
  return (
    <View style={[s.box, { borderColor: c.line }]}>
      {shown.map((r, i) => (
        <View key={`${r.label}-${i}`} style={[s.row, i > 0 && { borderTopWidth: 1, borderTopColor: c.line }]}>
          <Text variant="caption" tone="gray" style={s.label}>{r.label}</Text>
          {typeof r.value === "string" || typeof r.value === "number" ? <Text variant="small" weight="semibold" style={s.value} selectable>{r.value}</Text> : r.value}
        </View>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  box: { borderWidth: 1, borderRadius: 16, overflow: "hidden" },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12, padding: 13 },
  label: { flexShrink: 0, maxWidth: "42%" },
  value: { flexShrink: 1, textAlign: "right" },
});
