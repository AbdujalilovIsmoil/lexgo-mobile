import type { Drill, DrillSection } from "@/entities/admin-dash";
import { fmtDate } from "@/shared/lib/format";
import type { RetCtx } from "./useRetentionCtx";

const period = (x: RetCtx): DrillSection => {
  const { t, fmt, d } = x;
  return { kind: "kv", title: t("admDashB.drill.retention"), rows: [
    { label: t("admDashB.drill.prevActive"), value: fmt.int(d.previousPeriodActive) }, { label: t("admDashB.drill.curActive"), value: fmt.int(d.currentPeriodActive) },
    { label: t("admDashB.drill.retainedClients"), value: fmt.int(d.retainedClients), tone: "ok" }, { label: t("admRet.churned"), value: fmt.int(d.churnedThisMonth), tone: "bad" },
    { label: t("admDashB.drill.atRiskLeads"), value: fmt.int(d.atRiskLeads) },
  ] };
};
const risk = (x: RetCtx): DrillSection => ({
  kind: "list", title: x.t("admRet.atRiskTitle"), empty: x.t("admRet.noRisk"),
  rows: x.d.atRiskClients.map((c) => ({ label: c.name || c.phone, value: c.lastPaidAt ? x.t("admRet.lastPaid", { date: fmtDate(c.lastPaidAt, x.locale) }) : x.t("admRet.neverPaid"), sub: c.reasons.map(x.label.reason).join(", "), tone: "bad" })),
});
const upsell = (x: RetCtx): DrillSection => ({
  kind: "list", title: x.t("admRet.upsellTitle"), empty: x.t("admRet.noUpsell"),
  rows: x.d.upsell.map((u) => ({ label: u.name, value: u.price ? x.fmt.money(u.price) : "", sub: u.suggestion })),
});

export const atRiskDrill = (x: RetCtx): Drill => ({ title: x.t("admRet.atRisk"), value: x.fmt.int(x.d.atRisk), demo: x.demo, sections: [risk(x), period(x)] });
export const churnedDrill = (x: RetCtx): Drill => ({ title: x.t("admRet.churned"), value: x.fmt.int(x.d.churnedThisMonth), demo: x.demo, sections: [period(x), risk(x)] });
export const retainedDrill = (x: RetCtx): Drill => ({ title: x.t("admRet.retained"), value: x.fmt.pct(x.d.retainedPct), demo: x.demo, sections: [period(x), upsell(x)] });
