import { StyleSheet, View } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { Card, Icon, Text, type IconName } from "@/shared/ui";
import { useColors } from "@/shared/theme";

type Props = { icon: IconName; colors: [string, string]; label: string; value: string; hint?: string; ratio?: number; index: number; onPress: () => void };

// One of the three headline cards under the revenue hero; `ratio` (0..1) draws a progress bar.
export function MiniKpi({ icon, colors, label, value, hint, ratio, index, onPress }: Props) {
  const c = useColors();
  return (
    <Animated.View entering={FadeInUp.delay(80 + index * 70).duration(360)} style={s.cell}>
      <Card onPress={onPress} style={s.card} accessibilityRole="button" accessibilityLabel={label}>
        <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.icon}><Icon name={icon} size={16} tone="white" /></LinearGradient>
        <Text variant="h4" numberOfLines={1} adjustsFontSizeToFit>{value}</Text>
        <Text variant="caption" tone="gray" numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.75}>{label}</Text>
        {ratio != null ? (
          <View style={[s.track, { backgroundColor: c.line }]}><LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[s.fill, { width: `${Math.round(Math.min(Math.max(ratio, 0), 1) * 100)}%` }]} /></View>
        ) : hint ? <Text variant="caption" tone="gray2" numberOfLines={1}>{hint}</Text> : null}
      </Card>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  cell: { flex: 1 },
  card: { padding: 12, gap: 4, flex: 1 },
  icon: { width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center", marginBottom: 4 },
  track: { height: 5, borderRadius: 3, overflow: "hidden", marginTop: 4 },
  fill: { height: 5, borderRadius: 3 },
});
