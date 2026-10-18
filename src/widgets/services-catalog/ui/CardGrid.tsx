import { Children, type ReactNode } from "react";
import { StyleSheet, View } from "react-native";

// Two to a row; an odd last tile keeps its own width instead of stretching.
export function CardGrid({ children }: { children: ReactNode }) {
  const items = Children.toArray(children);
  const rows: ReactNode[][] = [];
  for (let i = 0; i < items.length; i += 2) rows.push(items.slice(i, i + 2));
  return (
    <View style={s.col}>
      {rows.map((r, i) => (
        <View key={i} style={s.row}>
          {r}
          {r.length === 1 ? <View style={s.fill} /> : null}
        </View>
      ))}
    </View>
  );
}

const s = StyleSheet.create({ col: { gap: 10 }, row: { flexDirection: "row", gap: 10 }, fill: { flex: 1 } });
