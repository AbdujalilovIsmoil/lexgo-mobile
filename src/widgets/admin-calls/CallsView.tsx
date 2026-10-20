import { useState } from "react";
import { useCallsView, type Drill } from "@/entities/admin-dash";
import { DashFrame, useDashFilter } from "@/widgets/admin-dash-filters";
import { DrillSheet } from "@/widgets/admin-dash-drill";
import { useT } from "@/shared/i18n";
import { CallsHero } from "./view/CallsHero";
import { DayBars } from "./view/DayBars";
import { Podium } from "./view/Podium";
import { useCallsCtx } from "./useCallsCtx";

// Call analytics body: answer-rate gauge with the counts, calls per day as bars and a podium of the busiest agents; the filters are
// in a bottom sheet. `tab`: inside a bottom-tab page (the page header scrolls with it, the last card clears the tab bar).
export function CallsView({ tab }: { tab?: boolean }) {
  const { t } = useT();
  const f = useDashFilter();
  const view = useCallsView(f.filter);
  const x = useCallsCtx(view.data, f.filter, view.demo);
  const [drill, setDrill] = useState<Drill | null>(null);
  return (
    <>
      <DashFrame f={f} view={view} sheetFilters tabPad={tab} tabHeader={tab}>
        <CallsHero x={x} onOpen={setDrill} />
        <DayBars title={t("admCalls.byDay")} points={x.byDay} empty={t("admCalls.noData")} />
        <Podium x={x} />
      </DashFrame>
      <DrillSheet drill={drill} onClose={() => setDrill(null)} />
    </>
  );
}
