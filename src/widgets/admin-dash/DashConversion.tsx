import type { Drill } from "@/entities/admin-dash";
import { KpiGrid, KpiTile, SectionCard } from "@/shared/ui/admin";
import type { DashCtx } from "./lib/useDashCtx";
import { drillConversion } from "./drills/people";

// Share of the previous funnel stage that reached the next one (undefined while a stage has no data).
const step = (x: DashCtx, from: string, to: string) => {
  const n = (k: string) => x.funnel.find((p) => p.label === k)?.value;
  const a = n(from);
  const b = n(to);
  return a && b !== undefined ? (b / a) * 100 : undefined;
};

// "Konversiya": overall conversion plus each funnel step (lead -> order -> paid); "Batafsil" opens the funnel drawer.
export function DashConversion({ x, onOpen }: { x: DashCtx; onOpen: (d: Drill) => void }) {
  const { t, fmt, c } = x;
  const go = () => onOpen(x.withDemo(drillConversion(x)));
  const paid = x.funnel.find((p) => p.label === "paid")?.value ?? x.stat("paid_count");
  if (!c) return null;
  return (
    <SectionCard title={t("admDashC.crm.conversion")} action={{ label: t("admDashB.drill.details"), onPress: go }}>
      <KpiGrid>
        <KpiTile icon="target" tint="#F59E0B" label={t("admDashC.crm.conversion")} value={fmt.pct(c.conversionPct)} onPress={go} />
        <KpiTile icon="check-circle" tint="#22C55E" label={t("admDashC.stage.paid")} value={fmt.int(paid)} onPress={go} />
        <KpiTile icon="users" label={t("admDashC.crm.leadToOrder")} value={fmt.pct(step(x, "leads", "orders"))} onPress={go} />
        <KpiTile icon="credit-card" label={t("admDashC.crm.orderToPaid")} value={fmt.pct(step(x, "orders", "paid"))} onPress={go} />
      </KpiGrid>
    </SectionCard>
  );
}
