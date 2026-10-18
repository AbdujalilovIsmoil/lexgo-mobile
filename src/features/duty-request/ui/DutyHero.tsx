import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { GradientBox, Icon, Text, type IconName } from "@/shared/ui";
import { radius } from "@/shared/theme";

type Props = { icon: IconName; title: string; sub?: string; done: number; total: number };

// The form's opening card: what this request is, and how much of the required part is already filled in
// (the bar eases to the new share each time a requirement is met).
export function DutyHero({ icon, title, sub, done, total }: Props) {
  const p = useSharedValue(0);
  useEffect(() => {
    p.value = withTiming(total ? done / total : 0, { duration: 420 });
  }, [done, total, p]);
  const fill = useAnimatedStyle(() => ({ width: `${p.value * 100}%` }));
  return (
    <Animated.View entering={FadeInDown.duration(320)}>
      <GradientBox round={radius.rl} style={s.box}>
        <View style={s.row}>
          <View style={s.tile}><Icon name={icon} size={22} color="#FFFFFF" /></View>
          <View style={s.col}>
            <Text variant="h3" tone="white">{title}</Text>
            {sub ? <Text variant="small" style={s.sub}>{sub}</Text> : null}
          </View>
        </View>
        <View style={s.bar}>
          <View style={s.track}><Animated.View style={[s.fill, fill]} /></View>
          <Text variant="caption" weight="bold" tone="white">{done}/{total}</Text>
        </View>
      </GradientBox>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  box: { padding: 18, gap: 16 },
  row: { flexDirection: "row", alignItems: "center", gap: 14 },
  tile: { width: 46, height: 46, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
  col: { flex: 1, gap: 2 },
  sub: { color: "rgba(255,255,255,0.82)" },
  bar: { flexDirection: "row", alignItems: "center", gap: 10 },
  track: { flex: 1, height: 6, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.25)", overflow: "hidden" },
  fill: { height: 6, borderRadius: 3, backgroundColor: "#FFFFFF" },
});
