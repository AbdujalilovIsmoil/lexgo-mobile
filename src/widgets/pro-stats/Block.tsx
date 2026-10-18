import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { Card, Text } from "@/shared/ui";

// Titled section: a heading outside, then the content (a grid or one card).
export function Block({ title, right, children }: { title: string; right?: ReactNode; children: ReactNode }) {
  return (
    <View style={s.wrap}>
      <View style={s.head}>
        <Text variant="h4" style={s.title}>{title}</Text>
        {right}
      </View>
      {children}
    </View>
  );
}

// Two columns; an odd last tile keeps half width so every tile has the same size.
export function Grid({ children }: { children: ReactNode[] }) {
  const rows: ReactNode[][] = [];
  for (let i = 0; i < children.length; i += 2) rows.push(children.slice(i, i + 2));
  return (
    <View style={s.grid}>
      {rows.map((r, i) => (
        <View key={i} style={s.row}>{r}{r.length === 1 ? <View style={s.fill} /> : null}</View>
      ))}
    </View>
  );
}

export const Panel = Card;

const s = StyleSheet.create({
  wrap: { gap: 10 },
  head: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", minHeight: 24 },
  title: { flex: 1 },
  grid: { gap: 12 },
  row: { flexDirection: "row", gap: 12, alignItems: "stretch" },
  fill: { flex: 1, minWidth: 0 },
});
