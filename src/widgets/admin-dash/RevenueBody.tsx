import { useState } from "react";
import { View } from "react-native";
import { useDashOverview } from "@/entities/admin-dash";
import { DashFrame, useDashFilter } from "@/widgets/admin-dash-filters";
import { DrillSectionView } from "@/widgets/admin-dash-drill";
import { RevenueHero } from "./hero/RevenueHero";
import { drillMrr, drillRevenue } from "./drills/money";
import { useDashCtx } from "./lib/useDashCtx";

// Body of the revenue screen: the big scrubbable chart, then the payment / channel / MRR breakdowns.
export function RevenueBody() {
  const f = useDashFilter();
  const ov = useDashOverview(f.filter);
  const x = useDashCtx(ov, f.filter);
  const [w, setW] = useState(0);
  const sections = [...drillRevenue(x).sections.slice(1), ...drillMrr(x).sections];
  return (
    <DashFrame f={f} view={ov}>
      <View onLayout={(e) => setW(e.nativeEvent.layout.width)} style={{ gap: 16 }}>
        {w > 0 ? <RevenueHero x={x} width={w} tall /> : null}
        {sections.map((s, i) => <DrillSectionView key={i} s={s} />)}
      </View>
    </DashFrame>
  );
}
