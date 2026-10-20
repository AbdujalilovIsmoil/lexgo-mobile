import { useState } from "react";
import { useCallsView, type Drill } from "@/entities/admin-dash";
import { CallsHero, DayBars, Podium, useCallsCtx } from "@/widgets/admin-calls";
import { DashFrame, useDashFilter } from "@/widgets/admin-dash-filters";
import { DrillSheet } from "@/widgets/admin-dash-drill";
import { useT } from "@/shared/i18n";
import { AdminPage } from "@/shared/ui/admin";

// Call analytics: answer-rate gauge with the counts, calls per day as bars and a podium of the busiest agents.
export default function AdminCallsPage() {
  const { t } = useT();
  const f = useDashFilter();
  const view = useCallsView(f.filter);
  const x = useCallsCtx(view.data, f.filter, view.demo);
  const [drill, setDrill] = useState<Drill | null>(null);
  return (
    <AdminPage title={t("admHub.mod.callAnalytics.title")}>
      <DashFrame f={f} view={view} sheetFilters>
        <CallsHero x={x} onOpen={setDrill} />
        <DayBars title={t("admCalls.byDay")} points={x.byDay} empty={t("admCalls.noData")} />
        <Podium x={x} />
      </DashFrame>
      <DrillSheet drill={drill} onClose={() => setDrill(null)} />
    </AdminPage>
  );
}
