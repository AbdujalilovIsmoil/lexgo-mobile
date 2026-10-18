import { useMemo, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { useCases } from "@/entities/pro-cases";
import { isNewSeller, val } from "@/entities/pro-stats";
import { usePayouts, useStats } from "@/entities/pro-workspace";
import { isForbidden } from "@/shared/api";
import { useT } from "@/shared/i18n";
import { useInsets } from "@/shared/lib/insets";
import { Card, EmptyState, ErrorView, Icon, Segmented, Text } from "@/shared/ui";
import { useColors } from "@/shared/theme";
import { CaseMix } from "./CaseMix";
import { Hero } from "./Hero";
import { Payouts } from "./Payouts";
import { Performance } from "./Performance";
import { Tiles } from "./Tiles";

type Period = "today" | "month";

// Professional statistics (GET /lawyers/me/stats + /payouts/me): earnings hero with a period switch, workload and
// finance tiles, performance meters, cases by status and the payout ledger.
export function ProStats() {
  const { t } = useT();
  const c = useColors();
  const insets = useInsets();
  const q = useStats();
  const pay = usePayouts();
  const cases = useCases();
  const [period, setPeriod] = useState<Period>("month");
  const rows = useMemo(() => [...(pay.data ?? [])].sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || "")), [pay.data]);
  if (q.isError) return isForbidden(q.error) ? <EmptyState icon="lock" title={t("aw9.forbidden")} /> : <ErrorView error={q.error} onRetry={() => void q.refetch()} />;
  const d = q.data;
  const loading = q.isLoading;
  const key = period === "today" ? "earnings_today" : "earnings_month";
  const series = rows.slice(0, 6).map((p) => p.amount).reverse();
  const fresh = !!d && !pay.isLoading && !cases.isLoading && isNewSeller({ workload: d.workload, finance: d.finance, performance: d.performance, payouts: rows.length, cases: (cases.data ?? []).length, totalCases: d.totalCases });
  const refresh = () => { void q.refetch(); void pay.refetch(); void cases.refetch(); };
  return (
    <ScrollView contentContainerStyle={[s.body, { paddingBottom: insets.bottom + 40 }]} refreshControl={<RefreshControl refreshing={q.isRefetching} onRefresh={refresh} />} showsVerticalScrollIndicator={false}>
      <View style={s.period} accessibilityLabel={t("statUx.period")}>
        <Segmented options={[{ value: "today", label: t("statUx.today") }, { value: "month", label: t("statUx.month") }]} value={period} onChange={setPeriod} />
      </View>
      <Hero label={t(`aw9.f.${key}`)} amount={val(d?.finance, key)} series={series} loading={loading} />
      {fresh ? (
        <Card tinted style={s.fresh} accessible accessibilityLabel={`${t("statUx.newTitle")}. ${t("statUx.newText")}`}>
          <Icon name="bar-chart-2" size={20} color={c.accentStrong} />
          <View style={s.freshText}>
            <Text variant="small" weight="bold">{t("statUx.newTitle")}</Text>
            <Text variant="small" tone="gray">{t("statUx.newText")}</Text>
          </View>
        </Card>
      ) : null}
      <Tiles kind="w" stats={d} loading={loading} />
      <Tiles kind="f" stats={d} loading={loading} />
      <Performance stats={d} loading={loading} />
      <CaseMix />
      <Payouts rows={rows} loading={pay.isLoading} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  body: { padding: 16, gap: 22 },
  period: { marginBottom: -6 },
  fresh: { flexDirection: "row", gap: 12, alignItems: "flex-start", padding: 14 },
  freshText: { flex: 1, gap: 2 },
});
