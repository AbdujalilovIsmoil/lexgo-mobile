import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { Card, Text } from "@/shared/ui";

// Titled section: a heading outside, then the content (one list card).
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

export const Panel = Card;

const s = StyleSheet.create({
  wrap: { gap: 10 },
  head: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", minHeight: 24 },
  title: { flex: 1 },
});
