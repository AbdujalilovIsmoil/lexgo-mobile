import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { radius } from "@/shared/theme";
import { Icon, PressableScale, Text, type IconName } from "@/shared/ui";

type Props = { icon: IconName; tint: string; title: string; lead: string; pills: ReactNode; hint: string; hintIcon: IconName; onPress: () => void };

// A service that goes straight to the advocate on duty (YTH): a whole row lit in its own colour, white type, a big watermark icon.
export function ServiceTile({ icon, tint, title, lead, pills, hint, hintIcon, onPress }: Props) {
  return (
    <PressableScale onPress={onPress} scale={0.98} accessibilityRole="button" style={s.card}>
      <LinearGradient colors={[tint, "#0A1428"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1.2 }} style={StyleSheet.absoluteFill} />
      <View style={s.mark} pointerEvents="none"><Icon name={icon} size={120} color="rgba(255,255,255,0.1)" /></View>
      <View style={s.top}>
        <View style={s.icon}><Icon name={icon} size={22} tone="white" /></View>
        <View style={s.arrow}><Icon name="arrow-up-right" size={16} tone="white" /></View>
      </View>
      <Text variant="h4" tone="white">{title}</Text>
      <Text variant="small" style={s.dim}>{lead}</Text>
      <View style={s.pills}>{pills}</View>
      <View style={s.hint}><Icon name={hintIcon} size={14} tone="white" /><Text variant="caption" weight="semibold" tone="white" style={s.flex}>{hint}</Text></View>
    </PressableScale>
  );
}

const s = StyleSheet.create({
  card: { gap: 9, padding: 14, borderRadius: radius.rl, overflow: "hidden", alignSelf: "stretch" },
  mark: { position: "absolute", right: -18, bottom: -22 },
  top: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  icon: { width: 42, height: 42, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.22)" },
  arrow: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.22)" },
  dim: { color: "rgba(255,255,255,0.85)" },
  pills: { flexDirection: "row", flexWrap: "wrap", gap: 5 },
  hint: { flexDirection: "row", alignItems: "flex-start", gap: 6 },
  flex: { flex: 1 },
});
