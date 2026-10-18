import { http } from "@/shared/api";
import { asArr, asDict, asNum, asStr, uzs } from "@/shared/lib/json";
import type { Retention } from "../model/retentionTypes";
import type { DashFilter } from "../model/types";
import { dashQuery } from "./dashQuery";

// GET /retention/overview — at-risk clients carry `reasons[]` (older shape: one `reason`).
export async function getRetention(f?: DashFilter): Promise<Retention> {
  const d = asDict(await http(`/retention/overview${dashQuery(f)}`));
  return {
    atRisk: asNum(d.at_risk), atRiskLeads: asNum(d.at_risk_leads), churnedThisMonth: asNum(d.churned_this_month), retainedPct: asNum(d.retained_pct),
    previousPeriodActive: asNum(d.previous_period_active), currentPeriodActive: asNum(d.current_period_active), retainedClients: asNum(d.retained_clients),
    atRiskClients: asArr(d.at_risk_clients).map((x) => {
      const r = asDict(x);
      const reasons = asArr(r.reasons).map((s) => asStr(s)).filter(Boolean);
      if (!reasons.length && asStr(r.reason)) reasons.push(asStr(r.reason));
      return { id: asStr(r.id ?? r.client_user_id ?? r.user_id), name: asStr(r.name), phone: asStr(r.phone), reasons, lastPaidAt: asStr(r.last_paid_at ?? r.last_active) };
    }),
    upsell: asArr(d.upsell).map((x) => {
      const r = asDict(x);
      return { id: asStr(r.id), name: asStr(r.name ?? r.title), suggestion: asStr(r.suggestion ?? asDict(r.payload).reason ?? r.record_type), price: uzs(r, "price"), status: asStr(r.status) };
    }),
  };
}

// POST /retention/queue — put an at-risk client into the win-back queue.
export async function addWinBack(c: { id: string; phone: string; reasons: string[] }): Promise<void> {
  await http("/retention/queue", {
    method: "POST",
    body: { client_user_id: c.id || undefined, phone: c.phone || undefined, note: c.reasons.join(", "), offer: "win_back" },
  });
}
