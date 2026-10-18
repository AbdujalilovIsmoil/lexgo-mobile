import type { Drill } from "@/entities/admin-dash";
import { KpiGrid, KpiTile, SectionCard } from "@/shared/ui/admin";
import type { DashCtx } from "./lib/useDashCtx";
import { drillMrr } from "./drills/money";
import { drillMonetization } from "./drills/monetization";

// "Monetizatsiya": ARR, ARPU, platform share (take rate) and LTV. A tile or "Batafsil" opens the full money drawer.
export function DashMonetization({ x, onOpen }: { x: DashCtx; onOpen: (d: Drill) => void }) {
  const { t, fmt, c } = x;
  const go = (f: (x: DashCtx) => Drill) => () => onOpen(x.withDemo(f(x)));
  if (!c) return null;
  return (
    <SectionCard title={t("admDashC.crm.monetization")} action={{ label: t("admDashB.drill.details"), onPress: go(drillMonetization) }}>
      <KpiGrid>
        <KpiTile icon="credit-card" tint="#22C55E" label={t("admDashB.drill.arr")} value={fmt.short(c.arr)} onPress={go(drillMrr)} />
        <KpiTile icon="user" label={t("admDashB.drill.arpu")} value={fmt.short(c.arpu)} onPress={go(drillMonetization)} />
        <KpiTile icon="percent" label={t("admDashB.drill.takeRate")} value={fmt.pct(c.takeRate)} onPress={go(drillMonetization)} />
        <KpiTile icon="trending-up" tint="#22C55E" label={t("admDashB.drill.ltv")} value={fmt.short(c.ltv)} onPress={go(drillMonetization)} />
      </KpiGrid>
    </SectionCard>
  );
}
