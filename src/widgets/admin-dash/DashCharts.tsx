import type { Drill } from "@/entities/admin-dash";
import { Text } from "@/shared/ui";
import { BarList, LineChart, SectionCard } from "@/shared/ui/admin";
import type { DashCtx } from "./lib/useDashCtx";
import { drillConversion } from "./drills/people";

// Revenue trend and the sales funnel (both come from the CEO payload).
export function DashCharts({ x, onOpen }: { x: DashCtx; onOpen: (d: Drill) => void }) {
  const { t, fmt, label } = x;
  const empty = <Text variant="small" tone="gray">{x.t("admDash.empty")}</Text>;
  return (
    <>
      <SectionCard title={t("admDashC.crm.revenueTrend")}>
        {x.trend.length ? <LineChart data={x.trend.map((p) => ({ x: p.label, y: p.value }))} format={fmt.money} /> : empty}
      </SectionCard>
      <SectionCard title={t("admDashC.crm.funnel")} action={{ label: t("admDashB.drill.details"), onPress: () => onOpen(x.withDemo(drillConversion(x))) }}>
        {x.funnel.length ? <BarList items={x.funnel.map((f) => ({ label: label.stage(f.label), value: f.value }))} format={fmt.int} /> : empty}
      </SectionCard>
    </>
  );
}
