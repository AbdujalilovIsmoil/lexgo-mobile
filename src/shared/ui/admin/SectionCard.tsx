import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { Card } from "../Card";
import { PressableScale } from "../PressableScale";
import { Text } from "../Text";

type Props = { title?: string; action?: { label: string; onPress: () => void }; children: ReactNode; padded?: boolean };

// Titled block (a card) with an optional text action at the top right.
export function SectionCard({ title, action, children, padded = true }: Props) {
  return (
    <Card padded={false} style={s.card}>
      {title || action ? (
        <View style={s.head}>
          <Text variant="h4" style={s.title}>{title}</Text>
          {action ? <PressableScale onPress={action.onPress} hitSlop={8}><Text variant="small" weight="bold" tone="accent">{action.label}</Text></PressableScale> : null}
        </View>
      ) : null}
      <View style={padded ? s.body : undefined}>{children}</View>
    </Card>
  );
}

const s = StyleSheet.create({
  card: { overflow: "hidden" },
  head: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingTop: 14 },
  title: { flex: 1 },
  body: { padding: 16, gap: 10 },
});
