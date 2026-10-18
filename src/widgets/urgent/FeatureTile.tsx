import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { radius, useColors } from "@/shared/theme";
import { Icon, PressableScale, Text, type IconName } from "@/shared/ui";

type Props = { icon: IconName; tint: string; title: string; lead: string; pills: ReactNode; hint: string; hintIcon: IconName; onPress: () => void };

// The two everyday ways in (video, chat) as a ticket: a coloured stub with the icon on the left, the name, sentence and facts
// in the middle, and the delivery line on a tinted strip underneath the text.
export function FeatureTile({ icon, tint, title, lead, pills, hint, hintIcon, onPress }: Props) {
  const c = useColors();
  return (
    <PressableScale onPress={onPress} scale={0.98} accessibilityRole="button" style={[s.card, { backgroundColor: c.surface, borderColor: `${tint}66` }]}>
      <LinearGradient colors={[tint, `${tint}99`]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.stub}>
        <View style={s.ring} pointerEvents="none" />
        <View style={s.badge}><Icon name={icon} size={28} tone="white" /></View>
      </LinearGradient>
      <View style={s.col}>
        <View style={s.body}>
          <View style={s.head}>
            <Text variant="h4" style={s.flex}>{title}</Text>
            <Icon name="arrow-up-right" size={18} color={tint} />
          </View>
          <Text variant="small" tone="gray">{lead}</Text>
          <View style={s.pills}>{pills}</View>
        </View>
        <View style={[s.foot, { backgroundColor: `${tint}14` }]}>
          <Icon name={hintIcon} size={14} color={tint} />
          <Text variant="caption" weight="semibold" style={[s.flex, { color: tint }]}>{hint}</Text>
        </View>
      </View>
    </PressableScale>
  );
}

const s = StyleSheet.create({
  card: { flexDirection: "row", borderRadius: radius.rl, borderWidth: 1.5, overflow: "hidden" },
  stub: { width: 76, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  ring: { position: "absolute", width: 120, height: 120, borderRadius: 60, borderWidth: 14, borderColor: "rgba(255,255,255,0.12)", left: -44, bottom: -44 },
  badge: { width: 52, height: 52, borderRadius: 18, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.22)" },
  col: { flex: 1 },
  body: { gap: 8, padding: 14 },
  head: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  flex: { flex: 1 },
  pills: { flexDirection: "row", flexWrap: "wrap", gap: 5 },
  foot: { flexDirection: "row", alignItems: "flex-start", gap: 6, paddingHorizontal: 14, paddingVertical: 9 },
});
