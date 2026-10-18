import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { Card, Icon, PressableScale, Text } from "@/shared/ui";
import { FactRows, type Fact } from "@/shared/ui/admin";
import { useColors } from "@/shared/theme";

type Props = { title: string; rows: Fact[]; note?: ReactNode; warn?: boolean; onDismiss: () => void; children?: ReactNode };

// What an assist action left behind: title, payment state, key facts and a hint; dismissable.
export function ResultCard({ title, rows, note, warn, onDismiss, children }: Props) {
  const c = useColors();
  return (
    <Card style={s.card}>
      <View style={s.head}>
        <Icon name={warn ? "alert-triangle" : "check-circle"} size={20} color={warn ? c.warn : c.ok} />
        <Text variant="body" weight="bold" style={s.title}>{title}</Text>
        <PressableScale onPress={onDismiss} hitSlop={10}><Icon name="x" size={18} tone="gray" /></PressableScale>
      </View>
      {children}
      <FactRows rows={rows} />
      {note ? <Text variant="small" tone="gray">{note}</Text> : null}
    </Card>
  );
}

const s = StyleSheet.create({
  card: { gap: 12 },
  head: { flexDirection: "row", alignItems: "center", gap: 10 },
  title: { flex: 1 },
});
