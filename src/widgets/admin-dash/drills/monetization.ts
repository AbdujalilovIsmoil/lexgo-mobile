import type { Drill, DrillRow } from "@/entities/admin-dash";
import type { DashCtx } from "../lib/useDashCtx";
import { barsOf, revenueSeries } from "./shared";

const row = (label: string, value: string): DrillRow => ({ label, value });

// "Monetizatsiya" drawer: every money number of GET /analytics/ceo — headline, unit economics, channels and the revenue trend.
export function drillMonetization(x: DashCtx): Drill {
  const { t, fmt, c } = x;
  const d = (k: string) => t(`admDashB.drill.${k}`);
  return {
    title: t("admDashC.crm.monetization"), value: fmt.moneyOrDash(c?.arr), sub: t("admDashB.drill.arr"), note: t("admDashB.drill.mrrNote"),
    sections: [
      { kind: "kv", title: t("admDashC.crm.revenue"), rows: [row(t("admDashC.crm.revenue"), fmt.moneyOrDash(c?.revenue)), row(t("admDashC.crm.mrr"), fmt.moneyOrDash(c?.mrr)), row(d("arr"), fmt.moneyOrDash(c?.arr)), row(d("gmv"), fmt.moneyOrDash(c?.gmv)), row(d("paid"), fmt.int(c?.paidPayments))] },
      { kind: "kv", title: t("admCeo.kpi.title"), rows: [row(d("arpu"), fmt.moneyOrDash(c?.arpu)), row(d("takeRate"), fmt.pct(c?.takeRate)), row(d("ltv"), fmt.moneyOrDash(c?.ltv)), row(d("cac"), fmt.moneyOrDash(c?.cac)), row(d("cacClient"), fmt.moneyOrDash(c?.cacClient)), row(d("cacAdvocate"), fmt.moneyOrDash(c?.cacAdvocate)), row(t("admCeo.kpi.ltvCac"), c?.ltvCac ? `${c.ltvCac}×` : "—"), row(t("admCeo.kpi.payback", { n: c?.paybackMonths ?? 0 }), "")] },
      revenueSeries(x),
      barsOf(x, d("channels"), (c?.channels ?? []).map((ch) => ({ label: ch.name, value: ch.revenue })), x.label.source),
    ],
    link: { module: "ceo", label: t("admDashB.drill.goCeo") },
  };
}
