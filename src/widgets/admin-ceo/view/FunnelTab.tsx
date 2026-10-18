import { Gauge } from "@/shared/ui";
import { View } from "react-native";
import type { Drill } from "@/entities/admin-dash";
import { KpiGrid, KpiTile, SectionCard } from "@/shared/ui/admin";
import { CeoFunnelChannels } from "../CeoFunnelChannels";
import type { CeoCtx } from "../lib/useCeoCtx";
import { drillConversion } from "../drills/main";
import { FunnelSteps } from "./FunnelSteps";

// "Voronka": overall conversion gauge, the staged funnel and the channel split.
export function FunnelTab({ x, onOpen }: { x: CeoCtx; onOpen: (d: Drill) => void }) {
  const { t, fmt, c } = x;
  const open = () => onOpen(x.withDemo(drillConversion(x)));
  return (
    <View style={{ gap: 14 }}>
      <SectionCard title={t("admCeo.conversion")}>
        <Gauge value={(c?.conversionPct ?? 0) / 100} text={fmt.pct(c?.conversionPct)} label={t("admCeo.funnel")} color="#F59E0B" size={170} />
      </SectionCard>
      <SectionCard title={t("admCeo.funnel")} action={{ label: t("admDashB.drill.details"), onPress: open }}><FunnelSteps x={x} /></SectionCard>
      <KpiGrid>
        <KpiTile icon="user-plus" label={t("admCeo.kpi.newClients")} value={fmt.int(c?.newClients)} onPress={open} />
        <KpiTile icon="check-circle" tint="#22C55E" label={t("admCeo.kpi.paidPayments")} value={fmt.int(c?.paidPayments)} onPress={open} />
      </KpiGrid>
      <CeoFunnelChannels x={x} />
    </View>
  );
}
