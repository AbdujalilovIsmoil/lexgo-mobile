import type { Drill } from "@/entities/admin-dash";
import { KpiGrid, KpiTile, SectionCard } from "@/shared/ui/admin";
import type { DashCtx } from "./lib/useDashCtx";
import { drillQuality } from "./drills/qualityAll";

// "Sifat": rating, response SLA, complaint rate and resolved share (GET /quality/overview); "Batafsil" lists the flagged issues.
export function DashQuality({ x, onOpen }: { x: DashCtx; onOpen: (d: Drill) => void }) {
  const { t, fmt, q } = x;
  const go = () => onOpen(x.withDemo(drillQuality(x)));
  if (!q) return null;
  return (
    <SectionCard title={t("admDashC.crm.quality")} action={{ label: t("admDashB.drill.details"), onPress: go }}>
      <KpiGrid>
        <KpiTile icon="award" tint="#F59E0B" label={t("admDashC.crm.rating")} value={fmt.rating(q.avgRating)} onPress={go} />
        <KpiTile icon="shield" tint="#22C55E" label={t("admDashC.crm.sla")} value={fmt.pct(q.responseSlaPct)} onPress={go} />
        <KpiTile icon="alert-triangle" tint="#EF4444" label={t("admDashC.crm.complaintRate")} value={fmt.pct(q.complaintRate)} hint={`${fmt.int(q.flagged.length)} ${t("admDashB.drill.flagged").toLowerCase()}`} onPress={go} />
        <KpiTile icon="check-circle" tint="#22C55E" label={t("admDashB.drill.resolved")} value={fmt.pct(q.resolvedPct)} onPress={go} />
      </KpiGrid>
    </SectionCard>
  );
}
