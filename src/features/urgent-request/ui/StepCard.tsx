import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { radius, useColors } from "@/shared/theme";
import { Text } from "@/shared/ui";

type Props = { n: number; title: string; aside?: ReactNode; done?: boolean; children: ReactNode };

// One question of the order as a numbered card: the number turns into a green tick once it is answered.
export function StepCard({ n, title, aside, done, children }: Props) {
  const c = useColors();
  return (
    <View style={[s.card, { backgroundColor: c.surface, borderColor: done ? c.ok : c.line }]}>
      <View style={s.head}>
        <View style={[s.num, { backgroundColor: done ? c.ok : c.accent }]}><Text variant="caption" weight="bold" tone="white">{done ? "✓" : n}</Text></View>
        <Text variant="h4" style={s.flex}>{title}</Text>
        {aside}
      </View>
      {children}
    </View>
  );
}

const s = StyleSheet.create({
  card: { gap: 12, padding: 14, borderRadius: radius.rl, borderWidth: 1.5 },
  head: { flexDirection: "row", alignItems: "center", gap: 10 },
  num: { width: 26, height: 26, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  flex: { flex: 1 },
});
