import type { Drill } from "@/entities/admin-dash";
import type { DashCtx } from "../lib/useDashCtx";
import { revenueSeries } from "./shared";

const GO_CEO = (x: DashCtx) => ({ module: "ceo", label: x.t("admDashB.drill.goCeo") });

export function drillRevenue(x: DashCtx): Drill {
  const { t, fmt, c } = x;
  const delta = c?.revenueDeltaPct ? `${c.revenueDeltaPct > 0 ? "▲" : "▼"} ${Math.abs(c.revenueDeltaPct)}%` : undefined;
  return {
    title: t("admDashC.crm.revenue"), value: fmt.moneyOrDash(c?.revenue), sub: delta,
    sections: [
      revenueSeries(x),
      { kind: "kv", title: t("admDashB.drill.payments"), rows: [
        { label: t("admDashB.drill.paid"), value: fmt.moneyOrDash(x.stat("paid_amount")) }, { label: t("admDashB.drill.pending"), value: fmt.moneyOrDash(x.stat("pending_amount")) },
        { label: t("admDashB.drill.paidCount"), value: fmt.int(x.stat("paid_count") ?? 0) }, { label: t("admDashB.drill.pendingCount"), value: fmt.int(x.stat("pending_count") ?? 0) },
      ] },
      { kind: "bars", title: t("admDashB.drill.channels"), rows: (c?.channels ?? []).map((ch) => ({ label: x.label.source(ch.name), value: fmt.moneyOrDash(ch.revenue), n: ch.revenue, sub: `${fmt.int(ch.leads)} · ${ch.pct}%` })) },
    ],
    link: GO_CEO(x),
  };
}

export function drillMrr(x: DashCtx): Drill {
  const { t, fmt, c } = x;
  return {
    title: t("admDashC.crm.mrr"), value: fmt.moneyOrDash(c?.mrr), note: t("admDashB.drill.mrrNote"),
    sections: [{ kind: "kv", rows: [
      { label: t("admDashB.drill.arr"), value: fmt.moneyOrDash(c?.arr) }, { label: t("admDashB.drill.arpu"), value: fmt.moneyOrDash(c?.arpu) }, { label: t("admDashB.drill.gmv"), value: fmt.moneyOrDash(c?.gmv) },
      { label: t("admDashB.drill.takeRate"), value: fmt.pct(c?.takeRate) }, { label: t("admDashB.drill.ltv"), value: fmt.moneyOrDash(c?.ltv) }, { label: t("admDashB.drill.cac"), value: fmt.moneyOrDash(c?.cac) },
    ] }],
    link: GO_CEO(x),
  };
}

export function drillPayments(x: DashCtx, k: "paid" | "pending"): Drill {
  const { t, fmt } = x;
  return {
    title: t(k === "paid" ? "admDashC.crm.paidAmount" : "admDashC.crm.pendingAmount"), value: fmt.moneyOrDash(x.stat(`${k}_amount`)),
    sub: `${t("admDashB.drill.payments")}: ${fmt.int(x.stat(`${k}_count`) ?? 0)}`,
    sections: [revenueSeries(x)], detail: { metric: "payments", filter: x.filter },
  };
}
