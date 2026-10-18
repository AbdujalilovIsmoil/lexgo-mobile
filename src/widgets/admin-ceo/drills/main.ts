import type { Drill } from "@/entities/admin-dash";
import type { CeoCtx } from "../lib/useCeoCtx";
import { channelBars, funnelBars, kv, unitEcon } from "./core";

export function drillRevenue(x: CeoCtx): Drill {
  const { t, fmt, c } = x;
  return {
    title: t("admCeo.revenue"), value: fmt.money(c?.revenue), sub: c ? `${c.revenueDeltaPct >= 0 ? "▲" : "▼"} ${Math.abs(c.revenueDeltaPct)}%` : undefined,
    sections: [{ kind: "series", title: t("admCeo.revenueTrend"), points: x.trend, format: fmt.money }, channelBars(x), unitEcon(x)],
  };
}

export const drillMrr = (x: CeoCtx): Drill => ({
  title: x.t("admCeo.mrr"), value: x.fmt.money(x.c?.mrr), note: x.t("admDashB.drill.mrrNote"),
  sections: [unitEcon(x), kv(x.t("admDashB.drill.payments"), [{ label: x.t("admCeo.kpi.paidPayments"), value: String(x.c?.paidPayments ?? 0) }])],
});

export function drillUsers(x: CeoCtx): Drill {
  const { t, c } = x;
  return {
    title: t("admCeo.users"), value: String(c?.users ?? 0), sub: `${c?.activeUsers ?? 0} ${t("admCeo.active")}`,
    sections: [
      kv(t("admCeo.kpi.title"), [{ label: t("admCeo.kpi.mau"), value: String(c?.mau ?? 0) }, { label: t("admCeo.kpi.dau"), value: String(c?.dau ?? 0) }]),
      kv(t("admDashB.drill.newUsers"), [{ label: t("admCeo.kpi.newClients"), value: String(c?.newClients ?? 0) }, { label: t("admDashB.drill.newAdvocates"), value: String(c?.newAdvocates ?? 0) }, { label: t("admDashB.drill.newLawyers"), value: String(c?.newLawyers ?? 0) }]),
      kv(t("admDashB.drill.nps"), [{ label: t("admCeo.kpi.npsClient"), value: String(c?.npsClient ?? 0) }, { label: t("admCeo.kpi.npsAdvocate"), value: String(c?.npsAdvocate ?? 0) }]),
    ],
  };
}

export const drillConversion = (x: CeoCtx): Drill => ({
  title: x.t("admCeo.conversion"), value: x.fmt.pct(x.c?.conversionPct), sections: [funnelBars(x), channelBars(x)], link: { module: "pipeline", label: x.t("admDashB.drill.goPipeline") },
});
