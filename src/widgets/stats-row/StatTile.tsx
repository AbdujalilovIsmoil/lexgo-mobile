import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInUp } from "react-native-reanimated";
import { radius, shadows, useColors } from "@/shared/theme";
import { Icon, PressableScale, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { fmtMoney } from "@/shared/lib/money";
import { useCountUp } from "@/shared/lib/useCountUp";
import type { StatItem } from "./statsData";

// One bento tile: tinted corner glow, gradient icon, count-up number, label
// and a faint watermark icon. Tiles rise in one after another.
export function StatTile({ item, index, onPress }: { item: StatItem; index: number; onPress?: () => void }) {
  const c = useColors();
  const { t } = useT();
  const n = useCountUp(item.value, 1300, 250 + index * 120);
  const [from, to] = item.colors;
  return (
    <Animated.View entering={FadeInUp.delay(index * 90).duration(420)} style={s.cell}>
    <PressableScale onPress={onPress} disabled={!onPress} scale={0.97} style={[s.tile, { backgroundColor: c.surface, borderColor: c.line }, shadows.s1]}>
      <LinearGradient colors={[`${from}2E`, `${from}00`]} start={{ x: 0, y: 0 }} end={{ x: 0.9, y: 0.9 }} style={StyleSheet.absoluteFill} />
      <View style={s.mark}>
        <Icon name={item.icon} size={84} color={`${from}1A`} />
      </View>
      {onPress ? <View style={s.go}><Icon name="arrow-up-right" size={16} color={from} /></View> : null}
      <LinearGradient colors={[from, to]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.badge}>
        <Icon name={item.icon} size={18} color="#FFFFFF" />
      </LinearGradient>
      <Text style={[s.value, { color: c.ink }]}>
        {fmtMoney(n)}
        <Text style={[s.suffix, { color: from }]}>{item.suffix}</Text>
      </Text>
      <Text variant="small" tone="gray" numberOfLines={1}>
        {t(item.labelKey)}
      </Text>
    </PressableScale>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  cell: { flex: 1 },
  tile: { flex: 1, minHeight: 124, borderRadius: radius.rl, borderWidth: 1, padding: 16, gap: 6, overflow: "hidden" },
  go: { position: "absolute", top: 12, right: 12 },
  mark: { position: "absolute", right: -14, bottom: -16 },
  badge: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center", marginBottom: 6 },
  value: { fontFamily: "Onest_800ExtraBold", fontSize: 30, lineHeight: 34, letterSpacing: -1 },
  suffix: { fontFamily: "Onest_700Bold", fontSize: 16 },
});
