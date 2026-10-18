import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { radius, useColors } from "@/shared/theme";
import { Icon, Text, type IconName } from "@/shared/ui";

// A titled surface of the detail screen (icon tile + title, then the content).
export function Card({ icon, title, children }: { icon: IconName; title: string; children: ReactNode }) {
  const c = useColors();
  return (
    <View style={[s.card, { backgroundColor: c.surface, borderColor: c.line }]}>
      <View style={s.title}><View style={[s.ico, { backgroundColor: c.tint2 }]}><Icon name={icon} size={15} tone="accent" /></View><Text variant="body" weight="bold">{title}</Text></View>
      {children}
    </View>
  );
}

const s = StyleSheet.create({
  card: { gap: 12, padding: 16, borderRadius: radius.rl, borderWidth: 1 },
  title: { flexDirection: "row", alignItems: "center", gap: 10 },
  ico: { width: 28, height: 28, borderRadius: 10, alignItems: "center", justifyContent: "center" },
});
