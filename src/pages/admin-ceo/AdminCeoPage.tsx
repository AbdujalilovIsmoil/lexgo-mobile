import { useState } from "react";
import { useCeoView, type Drill } from "@/entities/admin-dash";
import { CeoTabs, useCeoCtx } from "@/widgets/admin-ceo";
import { DashFrame, useDashFilter } from "@/widgets/admin-dash-filters";
import { DrillSheet } from "@/widgets/admin-dash-drill";
import { useT } from "@/shared/i18n";
import { AdminPage } from "@/shared/ui/admin";

// CEO dashboard: four views — money, audience, funnel and the gift program — each with charts and gauges.
export default function AdminCeoPage({ tab }: { tab?: boolean }) {
  const { t } = useT();
  const f = useDashFilter();
  const view = useCeoView(f.filter);
  const x = useCeoCtx(view.data, f.filter, view.demo);
  const [drill, setDrill] = useState<Drill | null>(null);
  return (
    <AdminPage title={t("admHub.mod.ceo.title")} hideBack={tab}>
      <DashFrame f={f} view={view} tabPad={tab}>
        <CeoTabs x={x} onOpen={setDrill} />
      </DashFrame>
      <DrillSheet drill={drill} onClose={() => setDrill(null)} />
    </AdminPage>
  );
}
