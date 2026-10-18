import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { useColors } from "@/shared/theme";
import { Icon, PressableScale, Text } from "@/shared/ui";

type Props = { label: string; value: number; max: number; color: string; onPress?: () => void };

// Label + count with a proportional bar that grows in. Tappable when onPress is set.
export function BarRow({ label, value, max, color, onPress }: Props) {
  const c = useColors();
  const p = useSharedValue(0);
  useEffect(() => {
    p.value = withTiming(max ? value / max : 0, { duration: 650 });
  }, [value, max, p]);
  const fill = useAnimatedStyle(() => ({ width: `${p.value * 100}%` }));
  return (
    <PressableScale onPress={onPress} disabled={!onPress} scale={0.985} style={s.row}>
      <View style={s.col}>
        <View style={s.head}>
          <Text variant="small" weight="semibold" numberOfLines={1} style={s.label}>{label}</Text>
          <Text variant="small" weight="bold">{value}</Text>
        </View>
        <View style={[s.track, { backgroundColor: c.surface2 }]}><Animated.View style={[s.fill, { backgroundColor: color }, fill]} /></View>
      </View>
      {onPress ? <Icon name="chevron-right" size={16} tone="gray" /> : null}
    </PressableScale>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  col: { flex: 1, gap: 6 },
  head: { flexDirection: "row", justifyContent: "space-between", gap: 8 },
  label: { flex: 1 },
  track: { height: 8, borderRadius: 4, overflow: "hidden" },
  fill: { height: 8, borderRadius: 4 },
});
