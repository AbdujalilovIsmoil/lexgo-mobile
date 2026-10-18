import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { Card, Icon, Text, type IconName } from "@/shared/ui";
import { useColors } from "@/shared/theme";

type Props = { icon: IconName; tone: "ok" | "warn" | "err" | "accent"; title: string; text?: string; children?: ReactNode };

// Result panel of the request form: icon chip, headline, explanation, then actions.
export function OutcomeCard({ icon, tone, title, text, children }: Props) {
  const c = useColors();
  const fg = tone === "accent" ? c.accent : c[tone];
  return (
    <Card style={s.card}>
      <View style={[s.chip, { backgroundColor: `${fg}22` }]}><Icon name={icon} size={28} color={fg} /></View>
      <Text variant="h3" center>{title}</Text>
      {text ? <Text variant="small" tone="gray" center>{text}</Text> : null}
      {children}
    </Card>
  );
}

const s = StyleSheet.create({
  card: { alignItems: "center", gap: 10, paddingVertical: 26 },
  chip: { width: 64, height: 64, borderRadius: 22, alignItems: "center", justifyContent: "center", marginBottom: 4 },
});
