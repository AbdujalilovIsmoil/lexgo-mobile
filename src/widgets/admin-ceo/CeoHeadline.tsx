import type { Drill } from "@/entities/admin-dash";
import { Text } from "@/shared/ui";
import { KpiGrid, KpiTile, LineChart, SectionCard } from "@/shared/ui/admin";
import type { CeoCtx } from "./lib/useCeoCtx";
import { drillConversion, drillMrr, drillRevenue, drillUsers } from "./drills/main";

// Revenue, MRR, users, conversion (each opens a drill-down) and the revenue trend.
export function CeoHeadline({ x, onOpen }: { x: CeoCtx; onOpen: (d: Drill) => void }) {
  const { t, fmt, c, regionHint } = x;
  const go = (f: (x: CeoCtx) => Drill) => () => onOpen(x.withDemo(f(x)));
  return (
    <>
      <KpiGrid>
        <KpiTile icon="credit-card" label={t("admCeo.revenue")} value={fmt.short(c?.revenue)} delta={c?.revenueDeltaPct || undefined} hint={regionHint} onPress={go(drillRevenue)} />
        <KpiTile icon="trending-up" tint="#22C55E" label={t("admCeo.mrr")} value={fmt.short(c?.mrr)} hint={regionHint} onPress={go(drillMrr)} />
        <KpiTile icon="users" label={t("admCeo.users")} value={fmt.int(c?.users)} hint={`${fmt.int(c?.activeUsers)} ${t("admCeo.active")}`} onPress={go(drillUsers)} />
        <KpiTile icon="target" label={t("admCeo.conversion")} value={fmt.pct(c?.conversionPct)} hint={regionHint} onPress={go(drillConversion)} />
      </KpiGrid>
      <SectionCard title={t("admCeo.revenueTrend")}>
        {x.trend.length ? <LineChart data={x.trend.map((p) => ({ x: p.label, y: p.value }))} format={fmt.money} /> : <Text variant="small" tone="gray">{t("admCeo.noData")}</Text>}
      </SectionCard>
    </>
  );
}
