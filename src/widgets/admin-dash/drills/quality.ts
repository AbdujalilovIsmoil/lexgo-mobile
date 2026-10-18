import type { Drill } from "@/entities/admin-dash";
import { fmtDate } from "@/shared/lib/format";
import type { DashCtx } from "../lib/useDashCtx";

const GO_RET = (x: DashCtx) => ({ module: "retention", label: x.t("admDashB.drill.goRetention") });

export function drillRetained(x: DashCtx): Drill {
  const { t, fmt, r } = x;
  return {
    title: t("admDashC.crm.retained"), value: fmt.pct(r?.retainedPct),
    sections: [{ kind: "kv", title: t("admDashB.drill.retention"), rows: [
      { label: t("admDashB.drill.prevActive"), value: fmt.int(r?.previousPeriodActive ?? 0) }, { label: t("admDashB.drill.curActive"), value: fmt.int(r?.currentPeriodActive ?? 0) },
      { label: t("admDashB.drill.retainedClients"), value: fmt.int(r?.retainedClients ?? 0) }, { label: t("admDashB.drill.churned"), value: fmt.int(r?.churnedThisMonth ?? 0), tone: "bad" },
    ] }],
    link: GO_RET(x),
  };
}

export function drillRating(x: DashCtx): Drill {
  const { t, fmt, q } = x;
  return {
    title: t("admDashC.crm.rating"), value: fmt.rating(q?.avgRating), note: t("admDashB.drill.constNote"),
    sections: [
      { kind: "kv", rows: [{ label: t("admDashB.drill.complaints"), value: fmt.pct(q?.complaintRate) }, { label: t("admDashB.drill.resolved"), value: fmt.pct(q?.resolvedPct) }, { label: t("admDashB.drill.sla"), value: fmt.pct(q?.responseSlaPct) }] },
      { kind: "list", title: t("admDashB.drill.flagged"), rows: (q?.flagged ?? []).map((f) => ({ label: f.title, value: x.label.severity(f.severity), sub: f.detail, tone: f.severity === "high" ? "bad" : "muted" })) },
    ],
  };
}

export function drillSla(x: DashCtx): Drill {
  const { t, fmt, q } = x;
  return {
    title: t("admDashC.crm.sla"), value: fmt.pct(q?.responseSlaPct), note: t("admDashB.drill.constNote"),
    sections: [{ kind: "kv", rows: [{ label: t("admDashB.drill.rating"), value: fmt.rating(q?.avgRating) }, { label: t("admDashB.drill.complaints"), value: fmt.pct(q?.complaintRate) }] }],
  };
}

export function drillAtRisk(x: DashCtx): Drill {
  const { t, fmt, r, locale } = x;
  return {
    title: t("admDashC.crm.atRisk"), value: r ? fmt.int(r.atRisk) : "—", sub: r ? `${t("admDashB.drill.atRiskLeads")}: ${fmt.int(r.atRiskLeads)}` : undefined,
    sections: [{ kind: "list", rows: (r?.atRiskClients ?? []).map((c) => ({ label: c.name || c.phone, value: c.lastPaidAt ? fmtDate(c.lastPaidAt, locale) : "", sub: c.reasons.map(x.label.reason).join(", "), tone: "bad" })) }],
    link: GO_RET(x),
  };
}
