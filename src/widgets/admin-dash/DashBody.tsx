import { useState } from "react";
import { useDashOverview, type Drill } from "@/entities/admin-dash";
import { DashFrame, useDashFilter } from "@/widgets/admin-dash-filters";
import { DrillSheet } from "@/widgets/admin-dash-drill";
import { DashAttention } from "./attention/DashAttention";
import { DashCharts } from "./DashCharts";
import { DashConversion } from "./DashConversion";
import { DashKpis } from "./DashKpis";
import { DashModules } from "./DashModules";
import { DashMonetization } from "./DashMonetization";
import { DashPayments } from "./DashPayments";
import { DashQuality } from "./DashQuality";
import { useDashCtx } from "./lib/useDashCtx";

// The web /admin overview as one block: filters, 12 KPI tiles, revenue + funnel, payments, orders, modules.
// Every tile opens its drill-down drawer. Used by the Boshqaruv > Dashboard page and the staff Home.
export function DashBody({ inline }: { inline?: boolean }) {
  const f = useDashFilter();
  const ov = useDashOverview(f.filter);
  const x = useDashCtx(ov, f.filter);
  const [drill, setDrill] = useState<Drill | null>(null);
  return (
    <>
      <DashFrame f={f} view={ov} inline={inline}>
        <DashAttention x={x} onOpen={setDrill} />
        <DashKpis x={x} onOpen={setDrill} />
        <DashMonetization x={x} onOpen={setDrill} />
        <DashCharts x={x} onOpen={setDrill} />
        <DashConversion x={x} onOpen={setDrill} />
        <DashPayments x={x} onOpen={setDrill} />
        <DashQuality x={x} onOpen={setDrill} />
        <DashModules />
      </DashFrame>
      <DrillSheet drill={drill} onClose={() => setDrill(null)} />
    </>
  );
}
