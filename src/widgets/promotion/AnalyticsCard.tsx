import { useState } from "react";
import type { Analytics } from "@/entities/promotion";
import { Text } from "@/shared/ui";
import { ChipBar, KpiGrid, KpiTile, LineChart, SectionCard } from "@/shared/ui/admin";
import { fmtCompact, fmtMoney } from "@/shared/lib/money";
import { useT } from "@/shared/i18n";

type Range = "7" | "30" | "all";

// Views and clicks of the promotions (GET /promotions/analytics) with a trend line over 7 / 30 days or everything.
export function AnalyticsCard({ data, spend }: { data: Analytics; spend: number }) {
  const { t } = useT();
  const [range, setRange] = useState<Range>("30");
  const days = range === "all" ? data.series.length : Number(range);
  const series = data.series.slice(-days);
  const ctr = data.impressions > 0 ? Math.round((data.profileClicks / data.impressions) * 1000) / 10 : 0;
  return (
    <SectionCard title={t("sl10.analytics")}>
      <KpiGrid>
        <KpiTile label={t("sl10.a.impressions")} value={fmtCompact(data.impressions)} icon="eye" tint="#3B82F6" />
        <KpiTile label={t("sl10.a.search")} value={fmtCompact(data.searchAppearances)} icon="search" tint="#06B6D4" />
        <KpiTile label={t("sl10.a.clicks")} value={fmtCompact(data.profileClicks)} hint={`CTR ${ctr}%`} icon="mouse-pointer" tint="#22C55E" />
        <KpiTile label={t("sl10.a.contacts")} value={fmtCompact(data.contactRequests)} icon="message-circle" tint="#F59E0B" />
        {spend > 0 ? <KpiTile label={t("sl10.a.spend")} value={fmtMoney(spend)} hint={t("adm.currency")} icon="credit-card" tint="#8B5CF6" /> : <></>}
      </KpiGrid>
      <ChipBar value={range} onChange={setRange} options={[{ value: "7", label: t("adm.d7") }, { value: "30", label: t("adm.d30") }, { value: "all", label: t("adm.all") }]} />
      {series.length > 1 ? <LineChart data={series.map((d) => ({ x: d.date.slice(5), y: d.impressions }))} /> : <Text variant="small" tone="gray">{t("sl10.noSeries")}</Text>}
    </SectionCard>
  );
}
