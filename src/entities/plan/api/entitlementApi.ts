import { http } from "@/shared/api";
import { asArr, asDict, asNum, asStr, uzs } from "@/shared/lib/json";
import type { Entitlements, PlanRequestRow } from "../model/entitlement";

export type { Entitlements } from "../model/entitlement";

function normRequest(v: unknown): PlanRequestRow {
  const d = asDict(v);
  const p = asDict(d.payload);
  return {
    id: asStr(d.id),
    workId: asStr(d.work_id ?? p.work_id),
    planTitle: asStr(p.plan_title ?? d.title),
    planId: asStr(p.plan_id),
    period: asStr(p.billing_period),
    amount: uzs(d, "price") || asNum(p.amount),
    currency: asStr(d.currency, "UZS"),
    status: asStr(d.status, "pending"),
    createdAt: asStr(d.created_at),
    paymentId: asStr(p.payment_id),
  };
}

// GET /clients/me/entitlements — what the signed-in client currently has.
export async function getEntitlements(): Promise<Entitlements> {
  const d = asDict(await http("/clients/me/entitlements"));
  const subs = asArr(d.active_subscriptions).map((x) => asDict(x));
  const md = asDict(d.manual_documents);
  const pending = asArr(d.pending_manual_document_plan_requests).map(normRequest).filter((r) => r.id);
  return {
    active: Boolean(d.has_active_subscription),
    endsAt: subs.map((x) => asStr(x.ends_at)).filter(Boolean).sort().pop() ?? "",
    planIds: subs.map((x) => asStr(x.plan_id)).filter(Boolean),
    pendingRequests: pending.length,
    templates: Boolean(md.manual_document_templates),
    subs: subs.map((x) => ({ id: asStr(x.id), planId: asStr(x.plan_id), startsAt: asStr(x.starts_at), endsAt: asStr(x.ends_at), familyCount: asArr(x.family_members).length })).filter((s) => s.id),
    shared: asArr(d.shared_family_members).map((x) => { const m = asDict(x); return { id: asStr(m.id), name: asStr(m.name), phone: asStr(m.phone), relation: asStr(m.relation) }; }),
    aiLimit: asStr(d.ai_limit),
    docs: { templates: Boolean(md.manual_document_templates), download: Boolean(md.template_download), fill: Boolean(md.manual_document_fill), source: asStr(md.source) },
    pending,
  };
}
