import { StyleSheet, View } from "react-native";
import Animated, { FadeInLeft } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { Text } from "@/shared/ui";
import type { CeoCtx } from "../lib/useCeoCtx";

// Funnel as stacked stages: bar width = share of the biggest stage, and the step conversion between stages
// (hidden when a later stage is larger than the previous one — e.g. payments counted per instalment).
export function FunnelSteps({ x }: { x: CeoCtx }) {
  const { t, fmt, label, c } = x;
  const rows = c?.funnel ?? [];
  const top = Math.max(1, ...rows.map((r) => r.value));
  if (!rows.length) return <Text variant="small" tone="gray">{t("admCeo.noData")}</Text>;
  return (
    <View style={s.col}>
      {rows.map((r, i) => (
        <View key={`${r.label}-${i}`} style={s.step}>
          {i > 0 && rows[i - 1].value && r.value <= rows[i - 1].value ? <Text variant="caption" tone="gray2" style={s.conv}>↓ {Math.round((r.value / rows[i - 1].value) * 100)}%</Text> : null}
          <Animated.View entering={FadeInLeft.delay(i * 90).duration(380)} style={{ width: `${Math.max(14, (r.value / top) * 100)}%` }}>
            <LinearGradient colors={["#1668F0", "#00CFE8"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[s.bar, { opacity: 1 - i * 0.13 }]}>
              <Text variant="small" weight="bold" tone="white" numberOfLines={1} style={s.fill}>{label.stage(r.label)}</Text>
              <Text variant="small" weight="bold" tone="white">{fmt.int(r.value)}</Text>
            </LinearGradient>
          </Animated.View>
        </View>
      ))}
    </View>
  );
}

const s = StyleSheet.create({ col: { gap: 4 }, step: { gap: 2 }, conv: { marginLeft: 6 }, bar: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 12, paddingVertical: 11, borderRadius: 14, minWidth: 120 }, fill: { flex: 1 } });
