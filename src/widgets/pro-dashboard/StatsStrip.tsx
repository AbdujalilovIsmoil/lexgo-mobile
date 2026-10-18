import { useRouter } from "expo-router";
import { MIN_REVIEWS, n, pct, useStats } from "@/entities/pro-workspace";
import { useT } from "@/shared/i18n";
import { fmtMoney } from "@/shared/lib/money";
import { uzs } from "@/shared/lib/json";
import { KpiGrid, KpiTile, SectionCard } from "@/shared/ui/admin";

// Rating, monthly income, response rate and completed cases from /lawyers/me/stats; opens the full stats.
export function StatsStrip({ completed }: { completed: number }) {
  const { t } = useT();
  const router = useRouter();
  const q = useStats();
  const d = q.data;
  const go = () => router.push("/pro/stats" as never);
  const isNew = (d?.reviews ?? MIN_REVIEWS) < MIN_REVIEWS;
  return (
    <SectionCard title={t("aw1.st.title")} action={{ label: t("aw1.all"), onPress: go }}>
      <KpiGrid>
        <KpiTile loading={q.isLoading} icon="star" tint="#F59E0B" label={t("aw1.st.rating")} value={isNew ? t("aw9.newBadge") : n(d?.performance, "rating") ? n(d?.performance, "rating").toFixed(1) : "—"} onPress={go} />
        <KpiTile loading={q.isLoading} icon="trending-up" tint="#22C55E" label={t("aw1.st.income")} value={`${fmtMoney(uzs(d?.finance ?? {}, "earnings_month"))} ${t("adm.currency")}`} onPress={go} />
        <KpiTile loading={q.isLoading} icon="zap" label={t("aw1.st.response")} value={`${pct(n(d?.performance, "response_rate"))}%`} onPress={go} />
        <KpiTile icon="check-circle" tint="#14B8A6" label={t("aw1.st.done")} value={String(completed)} onPress={() => router.push("/pro/cases" as never)} />
      </KpiGrid>
    </SectionCard>
  );
}
