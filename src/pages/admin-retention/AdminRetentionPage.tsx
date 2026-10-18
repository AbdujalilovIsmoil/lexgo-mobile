import { useState } from "react";
import { isRetentionOff, useRetentionView, type Drill } from "@/entities/admin-dash";
import { RetentionHero, RetentionOff, RiskList, UpsellRail, useRetentionCtx } from "@/widgets/admin-retention";
import { DashFrame, useDashFilter } from "@/widgets/admin-dash-filters";
import { DrillSheet } from "@/widgets/admin-dash-drill";
import { useT } from "@/shared/i18n";
import { AdminPage } from "@/shared/ui/admin";

// Retention: retained-share gauge and cohort, at-risk clients to win back (one or all), and an upsell rail.
export default function AdminRetentionPage() {
  const { t } = useT();
  const f = useDashFilter();
  const view = useRetentionView(f.filter);
  const x = useRetentionCtx(view.data, f.filter, view.demo);
  const [drill, setDrill] = useState<Drill | null>(null);
  return (
    <AdminPage title={t("admHub.mod.retention.title")}>
      <DashFrame f={f} view={view} errorSlot={isRetentionOff(view.error) ? <RetentionOff /> : undefined}>
        <RetentionHero x={x} onOpen={setDrill} />
        <RiskList x={x} />
        <UpsellRail x={x} />
      </DashFrame>
      <DrillSheet drill={drill} onClose={() => setDrill(null)} />
    </AdminPage>
  );
}
