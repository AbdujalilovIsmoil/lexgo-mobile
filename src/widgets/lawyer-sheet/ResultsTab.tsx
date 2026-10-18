import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { useColors } from "@/shared/theme";
import type { Lawyer } from "@/entities/lawyer";
import { Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { ReviewsList } from "./ReviewsList";

function Bar({ label, n, total, color }: { label: string; n: number; total: number; color: string }) {
  const c = useColors();
  const p = useSharedValue(0);
  useEffect(() => {
    p.value = withTiming(total ? n / total : 0, { duration: 700 });
  }, [n, total, p]);
  const fill = useAnimatedStyle(() => ({ width: `${p.value * 100}%` }));
  return (
    <View style={s.bar}>
      <View style={s.head}><Text variant="small" weight="semibold">{label}</Text><Text variant="small" weight="bold">{n}</Text></View>
      <View style={[s.track, { backgroundColor: c.surface2 }]}><Animated.View style={[s.fill, { backgroundColor: color }, fill]} /></View>
    </View>
  );
}

// Case outcomes as animated bars (full wins / partial wins / other).
export function ResultsTab({ lawyer: l }: { lawyer: Lawyer }) {
  const { t } = useT();
  const c = useColors();
  const other = Math.max(l.totalCases - l.winsCount - l.partialWins, 0);
  return (
    <View style={s.col}>
      <Text variant="small" tone="gray">{t("lw.cases")}</Text>
      {l.totalCases < 5 ? <Text variant="caption" tone="gray2">{t("mk2.gathering")}</Text> : null}
      <Text style={[s.big, { color: c.accent }]}>{l.totalCases}</Text>
      <Bar label={t("lw.wins.full")} n={l.winsCount} total={l.totalCases} color={c.ok} />
      <Bar label={t("lw.wins.partial")} n={l.partialWins} total={l.totalCases} color={c.accent} />
      <Bar label={t("lw.wins.other")} n={other} total={l.totalCases} color={c.gray2} />
      <ReviewsList lawyer={l} />
    </View>
  );
}

const s = StyleSheet.create({
  col: { gap: 14 },
  big: { fontFamily: "Onest_800ExtraBold", fontSize: 40, lineHeight: 44, marginTop: -8 },
  bar: { gap: 6 },
  head: { flexDirection: "row", justifyContent: "space-between" },
  track: { height: 10, borderRadius: 5, overflow: "hidden" },
  fill: { height: 10, borderRadius: 5 },
});
