import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { Icon, PressableScale, Text, type IconName } from "@/shared/ui";
import { useColors } from "@/shared/theme";

type Props = { icon: IconName; kind: "case" | "call"; title: string; sub: string; subBold?: boolean; onPress: () => void; children?: ReactNode };

// A tinted card: amber for the complaint, green for the call; a round icon tile, text and extras
// (working hours) in the middle and a small action circle on the right.
export function SupportItem({ icon, kind, title, sub, subBold, onPress, children }: Props) {
  const c = useColors();
  const fg = kind === "case" ? c.warn : c.ok;
  return (
    <PressableScale onPress={onPress} scale={0.98} accessibilityRole="menuitem" accessibilityLabel={title} style={[s.card, { backgroundColor: kind === "case" ? c.warnBg : c.okBg }]}>
      <View style={[s.tile, { backgroundColor: c.surface }]}><Icon name={icon} size={20} color={fg} /></View>
      <View style={s.tx}>
        <Text variant="small" weight="bold">{title}</Text>
        <Text variant={subBold ? "body" : "caption"} weight={subBold ? "bold" : undefined} tone={subBold ? "ink" : "gray"} numberOfLines={subBold ? 1 : 2} adjustsFontSizeToFit={subBold}>{sub}</Text>
        {children}
      </View>
      <View style={[s.go, { backgroundColor: fg }]}><Icon name={kind === "call" ? "phone" : "arrow-right"} size={16} tone="white" /></View>
    </PressableScale>
  );
}

const s = StyleSheet.create({
  card: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 18 },
  tile: { width: 42, height: 42, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  tx: { flex: 1, gap: 2 },
  go: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center" },
});
