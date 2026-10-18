import { Gauge } from "@/shared/ui";
import { View } from "react-native";
import type { Drill } from "@/entities/admin-dash";
import { MiniKpi, RevenueHero } from "@/widgets/admin-dash";
import { KpiGrid, KpiTile, SectionCard } from "@/shared/ui/admin";
import { CeoChannelList } from "../CeoChannelList";
import type { CeoCtx } from "../lib/useCeoCtx";
import { drillMrr, drillRevenue } from "../drills/main";
import { drillCac, simple } from "../drills/more";

// "Pul": revenue hero with a scrubbable trend, recurring money, unit economics gauges and the channel table.
export function MoneyTab({ x, w, onOpen }: { x: CeoCtx; w: number; onOpen: (d: Drill) => void }) {
  const { t, fmt, c } = x;
  const go = (f: (x: CeoCtx) => Drill) => () => onOpen(x.withDemo(f(x)));
  return (
    <View style={{ gap: 14 }}>
      <RevenueHero x={x} width={w} onOpen={go(drillRevenue)} />
      <View style={{ flexDirection: "row", gap: 10 }}>
        <MiniKpi index={0} icon="trending-up" colors={["#16A34A", "#4ADE80"]} label={t("admCeo.mrr")} value={fmt.short(c?.mrr)} onPress={go(drillMrr)} />
        <MiniKpi index={1} icon="credit-card" colors={["#1668F0", "#5CA8FF"]} label="ARR" value={fmt.short(c?.arr)} onPress={go(drillMrr)} />
        <MiniKpi index={2} icon="layers" colors={["#7A5CFF", "#B7A4FF"]} label="GMV" value={fmt.short(c?.gmv)} onPress={go(simple(t("admCeo.kpi.gmv"), fmt.money(c?.gmv)))} />
      </View>
      <SectionCard title={t("admCeo.kpi.ltvCac")}>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <Gauge value={(c?.ltvCac ?? 0) / 5} text={c?.ltvCac ? `${c.ltvCac}×` : "—"} label={`${t("admCeo.kpi.ltvCac")} · ${t("admCeo.kpi.payback", { n: c?.paybackMonths ?? 0 })}`} color="#22C55E" />
          <Gauge value={(c?.takeRate ?? 0) / 100} text={fmt.pct(c?.takeRate)} label={t("admCeo.kpi.takeRate")} color="#1668F0" />
        </View>
      </SectionCard>
      <KpiGrid>
        <KpiTile icon="credit-card" label={t("admCeo.kpi.cac")} value={fmt.moneyOrDash(c?.cac)} onPress={go(drillCac)} />
        <KpiTile icon="trending-up" tint="#22C55E" label={t("admCeo.kpi.ltv")} value={fmt.moneyOrDash(c?.ltv)} onPress={go(drillCac)} />
        <KpiTile icon="user" label={t("admCeo.kpi.arpu")} value={fmt.moneyOrDash(c?.arpu)} onPress={go(simple(t("admCeo.kpi.arpu"), fmt.money(c?.arpu)))} />
        <KpiTile icon="check-circle" tint="#22C55E" label={t("admCeo.kpi.paidPayments")} value={fmt.int(c?.paidPayments)} onPress={go(drillRevenue)} />
      </KpiGrid>
      <CeoChannelList x={x} />
    </View>
  );
}
