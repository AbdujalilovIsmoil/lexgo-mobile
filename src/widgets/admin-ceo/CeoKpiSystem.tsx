import { View } from "react-native";
import type { Drill } from "@/entities/admin-dash";
import { Text } from "@/shared/ui";
import { KpiGrid, KpiTile } from "@/shared/ui/admin";
import type { CeoCtx } from "./lib/useCeoCtx";
import { ratio } from "./drills/core";
import { drillMrr, drillRevenue, drillUsers } from "./drills/main";
import { drillCac, simple } from "./drills/more";

// The "KPI system": audience, money, unit economics, NPS and growth — every tile opens a drill-down.
export function CeoKpiSystem({ x, onOpen }: { x: CeoCtx; onOpen: (d: Drill) => void }) {
  const { t, fmt, c, regionHint: reg } = x;
  const go = (f: (x: CeoCtx) => Drill) => () => onOpen(x.withDemo(f(x)));
  const nps = [{ label: t("admCeo.kpi.npsClient"), value: String(c?.npsClient ?? 0) }, { label: t("admCeo.kpi.npsAdvocate"), value: String(c?.npsAdvocate ?? 0) }];
  const split = c && (c.cacClient || c.cacAdvocate) ? t("admCeo.kpi.cacSplit", { client: fmt.money(c.cacClient), advocate: fmt.money(c.cacAdvocate) }) : reg;
  return (
    <View style={{ gap: 10 }}>
      <Text variant="h4">{t("admCeo.kpi.title")}</Text>
      <KpiGrid>
        <KpiTile icon="users" label={t("admCeo.kpi.mau")} value={fmt.int(c?.mau)} hint={`${fmt.int(c?.dau)} ${t("admCeo.kpi.dau")}`} onPress={go(drillUsers)} />
        <KpiTile icon="trending-up" tint="#22C55E" label={t("admCeo.kpi.gmv")} value={fmt.short(c?.gmv)} hint={reg} onPress={go(simple(t("admCeo.kpi.gmv"), fmt.money(c?.gmv)))} />
        <KpiTile icon="credit-card" tint="#22C55E" label={t("admCeo.kpi.arr")} value={fmt.short(c?.arr)} hint={reg} onPress={go(drillMrr)} />
        <KpiTile icon="user" label={t("admCeo.kpi.arpu")} value={fmt.moneyOrDash(c?.arpu)} hint={reg} onPress={go(simple(t("admCeo.kpi.arpu"), fmt.money(c?.arpu)))} />
        <KpiTile icon="percent" label={t("admCeo.kpi.takeRate")} value={fmt.pct(c?.takeRate)} hint={reg} onPress={go(simple(t("admCeo.kpi.takeRate"), fmt.pct(c?.takeRate)))} />
        <KpiTile icon="credit-card" label={t("admCeo.kpi.cac")} value={fmt.moneyOrDash(c?.cac)} hint={split} onPress={go(drillCac)} />
        <KpiTile icon="trending-up" tint="#22C55E" label={t("admCeo.kpi.ltv")} value={fmt.moneyOrDash(c?.ltv)} hint={reg} onPress={go(drillCac)} />
        <KpiTile icon="target" label={t("admCeo.kpi.ltvCac")} value={ratio(x)} hint={t("admCeo.kpi.payback", { n: c?.paybackMonths ?? 0 })} onPress={go(drillCac)} />
        <KpiTile icon="smile" tint="#F59E0B" label={t("admCeo.kpi.npsClient")} value={fmt.int(c?.npsClient)} hint={reg} onPress={go(simple(t("admCeo.kpi.npsClient"), String(c?.npsClient ?? 0), nps))} />
        <KpiTile icon="award" tint="#F59E0B" label={t("admCeo.kpi.npsAdvocate")} value={fmt.int(c?.npsAdvocate)} hint={reg} onPress={go(simple(t("admCeo.kpi.npsAdvocate"), String(c?.npsAdvocate ?? 0), nps))} />
        <KpiTile icon="user-plus" label={t("admCeo.kpi.newClients")} value={fmt.int(c?.newClients)} hint={reg} onPress={go(drillUsers)} />
        <KpiTile icon="briefcase" label={t("admCeo.kpi.newSellers")} value={fmt.int(c ? c.newAdvocates + c.newLawyers : undefined)} hint={reg} onPress={go(drillUsers)} />
        <KpiTile icon="check-circle" tint="#22C55E" label={t("admCeo.kpi.paidPayments")} value={fmt.int(c?.paidPayments)} hint={reg} onPress={go(drillRevenue)} />
      </KpiGrid>
    </View>
  );
}
