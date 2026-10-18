import { View } from "react-native";
import { MIN_REVIEWS, n, pct, type Stats } from "@/entities/pro-workspace";
import { useT } from "@/shared/i18n";
import { Icon, Text } from "@/shared/ui";
import { KpiGrid, KpiTile, SectionCard } from "@/shared/ui/admin";

// Response / acceptance rate, average answer time, rating (shown as "New" under 5 reviews),
// a coaching tip and the progress towards "Super advokat".
export function Performance({ stats, loading }: { stats?: Stats; loading: boolean }) {
  const { t } = useT();
  const p = stats?.performance;
  const response = n(p, "response_rate");
  const avg = n(p, "avg_response_minutes");
  const rating = n(p, "rating");
  const isNew = (stats?.reviews ?? MIN_REVIEWS) < MIN_REVIEWS;
  const tip = avg > 15 ? t("aw9.tipSpeed", { now: avg, target: 15 }) : response < 0.9 && pct(response) < 90 ? t("aw9.tipRate") : t("aw9.tipGood");
  const crit = [
    { ok: rating > 4.5, label: t("aw9.super.rating") },
    { ok: response > 0.9 && pct(response) > 90, label: t("aw9.super.response") },
    { ok: (stats?.experienceYears ?? 0) >= 3, label: t("aw9.super.exp", { n: stats?.experienceYears ?? 0 }) },
    { ok: (stats?.totalCases ?? 0) >= 10, label: t("aw9.super.cases", { n: stats?.totalCases ?? 0 }) },
  ];
  return (
    <SectionCard title={t("aw9.performance")}>
      <KpiGrid>
        <KpiTile loading={loading} icon="trending-up" label={t("aw9.p.response")} value={`${pct(response)}%`} />
        <KpiTile loading={loading} icon="check-circle" label={t("aw9.p.acceptance")} value={p?.acceptance_rate == null ? "—" : `${pct(n(p, "acceptance_rate"))}%`} />
        <KpiTile loading={loading} icon="clock" label={t("aw9.p.avg")} value={avg ? t("aw9.minutes", { n: avg }) : "—"} />
        <KpiTile loading={loading} icon="star" tint="#F59E0B" label={t("aw9.p.rating")} value={isNew ? t("aw9.newBadge") : rating ? rating.toFixed(1) : "—"} hint={isNew ? t("aw9.newHint", { n: MIN_REVIEWS }) : undefined} />
      </KpiGrid>
      <Text variant="small" tone="gray">{tip}</Text>
      <Text variant="small" weight="bold">{t("aw9.super.title")}</Text>
      {crit.map((c) => (
        <View key={c.label} style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Icon name={c.ok ? "check-circle" : "circle"} size={18} color={c.ok ? "#22C55E" : undefined} tone="gray" />
          <Text variant="small" tone={c.ok ? "ink" : "gray"} style={{ flex: 1 }}>{c.label}</Text>
        </View>
      ))}
    </SectionCard>
  );
}
