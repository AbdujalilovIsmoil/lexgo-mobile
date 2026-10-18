import { StyleSheet, View } from "react-native";
import type { ReactNode } from "react";

// Lays children out two per row; the cells stretch so a row is one height.
export function OptionGrid({ children }: { children: ReactNode[] }) {
  const rows = Array.from({ length: Math.ceil(children.length / 2) }, (_, r) => children.slice(r * 2, r * 2 + 2));
  return (
    <View style={s.grid}>
      {rows.map((row, r) => (
        <View key={r} style={s.row}>
          {row}
          {row.length === 1 ? <View style={s.cell} /> : null}
        </View>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  grid: { gap: 10 },
  row: { flexDirection: "row", gap: 10 },
  cell: { flex: 1 },
});
