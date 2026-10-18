import type { Drill } from "@/entities/admin-dash";
import type { DashCtx } from "../lib/useDashCtx";
import { barsOf } from "./shared";

export function drillUsers(x: DashCtx): Drill {
  const { t, fmt, c } = x;
  return {
    title: t("admDashC.crm.users"), value: c ? fmt.int(c.users) : "—", sub: c ? `${t("admDashB.drill.activeUsers")}: ${fmt.int(c.activeUsers)}` : undefined,
    sections: [
      { kind: "kv", title: t("admDashB.drill.newUsers"), rows: [
        { label: t("admDashB.drill.newClients"), value: fmt.int(c?.newClients ?? 0) }, { label: t("admDashB.drill.newAdvocates"), value: fmt.int(c?.newAdvocates ?? 0) }, { label: t("admDashB.drill.newLawyers"), value: fmt.int(c?.newLawyers ?? 0) },
      ] },
      barsOf(x, t("admDashB.drill.byRole"), x.byRole, x.label.role),
      barsOf(x, t("admDashB.drill.byRegion"), x.byRegion, x.label.region, t("admDashB.drill.regionUnknown")),
    ],
    detail: { metric: "users", filter: x.filter },
  };
}

export function drillConversion(x: DashCtx): Drill {
  const { t, fmt } = x;
  return {
    title: t("admDashC.crm.conversion"), value: fmt.pct(x.c?.conversionPct),
    sections: [barsOf(x, t("admDashB.drill.funnel"), x.funnel, x.label.stage), barsOf(x, t("admDashB.drill.byScore"), x.byScore, x.label.score)],
    link: { module: "pipeline", label: t("admDashB.drill.goPipeline") },
  };
}

export function drillLeads(x: DashCtx): Drill {
  const { t, fmt } = x;
  return {
    title: t("admDashB.drill.leads"), value: fmt.int(x.stat("leads") ?? x.byScore.reduce((s, p) => s + p.value, 0)),
    sections: [barsOf(x, t("admDashB.drill.byScore"), x.byScore, x.label.score), barsOf(x, t("admDashB.drill.byRegion"), x.byRegion, x.label.region, t("admDashB.drill.regionUnknown"))],
    link: { module: "pipeline", label: t("admDashB.drill.goLeads") }, detail: { metric: "leads", filter: x.filter },
  };
}

export function drillOrders(x: DashCtx): Drill {
  const { t, fmt } = x;
  return {
    title: t("admDashC.crm.ordersByStatus"), value: fmt.int(x.byStatus.reduce((s, p) => s + p.value, 0)),
    sections: [barsOf(x, t("admDashB.drill.byStatus"), x.byStatus, x.label.status)], detail: { metric: "orders", filter: x.filter },
  };
}
