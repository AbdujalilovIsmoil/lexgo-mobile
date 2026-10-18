import { View } from "react-native";
import type { Drill } from "@/entities/admin-dash";
import { KpiGrid, KpiTile } from "@/shared/ui/admin";
import { DashHeadline } from "./hero/DashHeadline";
import type { DashCtx } from "./lib/useDashCtx";
import { drillB2b, drillCases, drillReviews, drillTasks } from "./drills/lists";
import { drillAtRisk, drillRetained } from "./drills/quality";

// Headline hero (revenue, MRR, users, conversion) + the other 8 tiles; each opens its breakdown.
export function DashKpis({ x, onOpen }: { x: DashCtx; onOpen: (d: Drill) => void }) {
  const { t, fmt, r, d, filter } = x;
  const reg = filter.region ? t("admDash.hint.regionNa") : undefined;
  const dat = filter.from || filter.to ? t("admDash.hint.dateNa") : undefined;
  const go = (f: (x: DashCtx) => Drill) => () => onOpen(x.withDemo(f(x)));
  const count = (k: string, n?: number) => fmt.int(x.stat(k) ?? n);
  return (
    <View style={{ gap: 10 }}>
      <DashHeadline x={x} onOpen={onOpen} />
      <KpiGrid>
      <KpiTile icon="user-check" tint="#22C55E" label={t("admDashC.crm.retained")} value={fmt.pct(r?.retainedPct)} hint={reg ?? dat} onPress={go(drillRetained)} />
      <KpiTile icon="alert-triangle" tint="#EF4444" label={t("admDashC.crm.atRisk")} value={fmt.int(r?.atRisk)} hint={reg} onPress={go(drillAtRisk)} />
      <KpiTile icon="file-text" tint="#8B5CF6" label={t("admDashC.metrics.cases")} value={count("cases")} onPress={go(drillCases)} />
      <KpiTile icon="check-square" tint="#06B6D4" label={t("admDashC.metrics.tasks")} value={count("tasks", d?.lists.tasks.length)} onPress={go(drillTasks)} />
      <KpiTile icon="briefcase" tint="#64748B" label={t("admDashC.metrics.b2b")} value={count("b2b_clients", d?.lists.b2bClients.length)} onPress={go(drillB2b)} />
      <KpiTile icon="star" tint="#F59E0B" label={t("admDashC.metrics.reviews")} value={count("reviews", d?.lists.reviews.length)} onPress={go(drillReviews)} />
      </KpiGrid>
    </View>
  );
}
