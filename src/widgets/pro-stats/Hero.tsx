import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useReducedMotion } from "react-native-reanimated";
import { deltaPct, fmtCount, sparkHeights, trendOf } from "@/entities/pro-stats";
import { useT } from "@/shared/i18n";
import { useCountUp } from "@/shared/lib/useCountUp";
import { fmtMoney } from "@/shared/lib/money";
import { gradient, radius } from "@/shared/theme";
import { Icon, Skeleton, Text } from "@/shared/ui";
import { SparkBar } from "./SparkBar";

type Props = { label: string; amount: number | undefined; series: number[]; loading: boolean };

const W = "rgba(255,255,255,";

// Headline earnings on the brand gradient: big number, a tiny bar sparkline of the latest payouts (oldest to newest)
// and the change of the newest payout against the one before it. The amount counts up from 0 and the bars rise one by one
// (both are skipped when the system asks for reduced motion).
export function Hero({ label, amount, series, loading }: Props) {
  const { t } = useT();
  const cur = t("adm.currency");
  const calm = useReducedMotion();
  const counted = useCountUp(amount ?? 0, 1300, 150);
  const value = amount == null ? "—" : fmtMoney(calm ? amount : counted);
  const d = series.length >= 2 ? deltaPct(series[series.length - 1], series[series.length - 2]) : null;
  const trend = trendOf(d);
  const heights = sparkHeights(series);
  const trendWord = trend ? t(`statUx.${trend}`) : "";
  const a11y = `${label}: ${amount == null ? "—" : `${value} ${cur}`}${d != null ? `, ${trendWord} ${Math.abs(d)}%` : ""}`;
  return (
    <LinearGradient colors={gradient.primary} locations={gradient.primaryStops} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.card}>
      <View accessible accessibilityLabel={a11y} style={s.top}>
        <Text variant="small" weight="semibold" tone="white" style={{ opacity: 0.85 }}>{label}</Text>
        {loading ? <Skeleton onDark width="60%" height={36} /> : (
          <View style={s.amountRow}>
            <Text variant="hx" tone="white" numberOfLines={1} adjustsFontSizeToFit style={s.amount}>{value}</Text>
            {amount != null ? <Text variant="lead" tone="white" weight="semibold" style={{ opacity: 0.85 }}>{cur}</Text> : null}
          </View>
        )}
      </View>
      <View style={s.bottom}>
        <View style={s.spark} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          {loading ? <Skeleton onDark width="100%" height={40} /> : heights.length ? heights.map((h, i) => (
            <SparkBar key={i} index={i} height={6 + h * 34} color={`${W}${i === heights.length - 1 ? 1 : 0.4})`} />
          )) : <Text variant="caption" tone="white" style={{ opacity: 0.8 }}>{t("statUx.sparkNone")}</Text>}
        </View>
        {d != null && trend ? (
          <View style={s.delta} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
            <Icon name={trend === "up" ? "trending-up" : trend === "down" ? "trending-down" : "minus"} size={14} color="#FFFFFF" />
            <Text variant="caption" weight="bold" tone="white">{d > 0 ? "+" : ""}{fmtCount(d)}%</Text>
          </View>
        ) : null}
      </View>
      {series.length ? <Text variant="caption" tone="white" style={{ opacity: 0.8 }} numberOfLines={1}>{t("statUx.sparkTitle")}{d != null ? ` · ${t("statUx.sparkVs")}` : ""}</Text> : null}
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  card: { borderRadius: radius.rx, padding: 20, gap: 14 },
  top: { gap: 4 },
  amountRow: { flexDirection: "row", alignItems: "baseline", gap: 8 },
  amount: { flexShrink: 1 },
  bottom: { flexDirection: "row", alignItems: "flex-end", gap: 12, minHeight: 40 },
  spark: { flex: 1, flexDirection: "row", alignItems: "flex-end", gap: 5, height: 40 },
  delta: { flexDirection: "row", alignItems: "center", gap: 4, paddingVertical: 5, paddingHorizontal: 9, borderRadius: radius.pill, backgroundColor: `${W}0.2)` },
});
