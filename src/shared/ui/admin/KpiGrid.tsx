import { Children, type ReactNode } from "react";
import { StyleSheet, View } from "react-native";

// Two tiles per row; a lone last tile keeps half width instead of stretching.
export function KpiGrid({ children }: { children: ReactNode }) {
  const items = Children.toArray(children);
  const rows: ReactNode[][] = [];
  for (let i = 0; i < items.length; i += 2) rows.push(items.slice(i, i + 2));
  return (
    <View style={[s.col, s.gap]}>
      {rows.map((r, i) => (
        <View key={i} style={s.row}>
          {r}
          {r.length === 1 ? <View style={s.fill} /> : null}
        </View>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  gap: { marginBottom: 12 }, col: { gap: 10 }, row: { flexDirection: "row", gap: 10 }, fill: { flex: 1 } });
