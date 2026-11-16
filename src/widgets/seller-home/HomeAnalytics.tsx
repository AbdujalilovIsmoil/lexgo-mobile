import { useMemo, useState } from "react";
import { Platform, StyleSheet, View, type LayoutChangeEvent } from "react-native";
import { useRouter } from "expo-router";
import Svg, { Polyline } from "react-native-svg";
import { ratePct, val } from "@/entities/pro-stats";
import { usePayouts, useStats } from "@/entities/pro-workspace";
import { PressableScale, Skeleton, Text } from "@/shared/ui";
import { useTheme } from "@/shared/theme";
import { fmtMoney } from "@/shared/lib/money";
import { useT } from "@/shared/i18n";

// A thin line through the values, scaled to the box (Adliya's tile sparkline).
function Spark({ values, color }: { values: number[]; color: string }) {
  const [w, setW] = useState(0);
  const h = 34;
  const pts = useMemo(() => {
    if (!w || values.length < 2) return "";
    const max = Math.max(...values), min = Math.min(...values);
    const span = max - min || 1;
    return values.map((v, i) => `${(i / (values.length - 1)) * w},${h - 3 - ((v - min) / span) * (h - 6)}`).join(" ");
  }, [w, values]);
  return (
    <View style={s.spark} onLayout={(e: LayoutChangeEvent) => setW(Math.round(e.nativeEvent.layout.width))}>
      {pts ? <Svg width={w} height={h}><Polyline points={pts} fill="none" stroke={color} strokeWidth={2.2} strokeLinejoin="round" strokeLinecap="round" /></Svg> : null}
    </View>
  );
}

type Tile = { key: string; label: string; value: string; spark?: number[] };

// "Analitika · noyabr" (Adliya): four tiles of the month from GET /lawyers/me/stats — income (with the line of the last payouts), active
// cases, the average reply time and the acceptance rate. A number the backend did not send is "—". "Batafsil" opens the statistics page.
// Nothing at all when the statistics are closed to this account.
export function HomeAnalytics() {
  const { t, tList } = useT();
  const { colors: c, dark, glass } = useTheme();
  const router = useRouter();
  const q = useStats();
  const pay = usePayouts();
  const [month] = useState(() => (tList("aw11.months")[new Date().getMonth()] ?? "").toLowerCase());
  if (q.isError) return null;
  const d = q.data;
  const series = [...(pay.data ?? [])].sort((a, b) => (a.createdAt || "").localeCompare(b.createdAt || "")).slice(-7).map((p) => p.amount);
  const income = val(d?.finance, "earnings_month");
  const active = val(d?.workload, "active_cases");
  const reply = val(d?.performance, "avg_response_minutes");
  const accept = ratePct(val(d?.performance, "acceptance_rate"));
  const tiles: Tile[] = [
    { key: "income", label: t("cdash.pro.income"), value: income == null ? "—" : `${fmtMoney(income)}`, spark: series.length > 1 ? series : undefined },
    { key: "active", label: t("cdash.pro.activeCases"), value: active == null ? "—" : String(Math.round(active)) },
    { key: "reply", label: t("cdash.pro.reply"), value: reply == null || reply <= 0 ? "—" : t("cdash.pro.minutes", { n: Math.round(reply) }) },
    { key: "accept", label: t("cdash.pro.accept"), value: accept == null ? "—" : `${accept}%` },
  ];
  const card = { backgroundColor: dark || glass ? c.surface : "#FFFFFF", borderColor: dark || glass ? c.line : "#E6EBF3" };
  return (
    <View style={s.col}>
      <View style={s.head}>
        <Text variant="h4" weight="bold" style={s.h}>{t("cdash.pro.analytics", { month })}</Text>
        <PressableScale onPress={() => router.push("/pro/stats" as never)} hitSlop={8} accessibilityRole="button">
          <Text variant="small" weight="bold" tone="accent" style={s.link}>{t("cdash.pro.more")}</Text>
        </PressableScale>
      </View>
      <View style={s.grid}>
        {tiles.map((x) => (
          <PressableScale key={x.key} onPress={() => router.push("/pro/stats" as never)} scale={0.98} accessibilityRole="button" accessibilityLabel={`${x.label}: ${x.value}`} style={[s.tile, card, !glass && s.shadow]}>
            <Text variant="small" tone="gray" numberOfLines={1}>{x.label}</Text>
            {q.isLoading ? <Skeleton width="70%" height={26} /> : <Text weight="bold" numberOfLines={1} adjustsFontSizeToFit style={[s.value, { color: c.ink }]}>{x.value}</Text>}
            {x.key === "income" && income != null ? <Text variant="caption" tone="gray" numberOfLines={1}>{t("adm.currency")}</Text> : null}
            {x.spark ? <Spark values={x.spark} color={c.accent} /> : null}
          </PressableScale>
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  col: { gap: 12 },
  head: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  h: { fontSize: 19, lineHeight: 25 },
  link: { fontSize: 15 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  tile: { flexBasis: "46%", flexGrow: 1, minHeight: 112, padding: 16, gap: 4, borderRadius: 20, borderWidth: 1 },
  value: { fontSize: 24, lineHeight: 30 },
  spark: { height: 34, marginTop: 6 },
  shadow: Platform.select({ ios: { shadowColor: "#0B1A33", shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } }, default: { elevation: 1 } })!,
});
