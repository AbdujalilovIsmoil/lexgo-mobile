import { http } from "@/shared/api";
import { asArr, asDict, asStr } from "@/shared/lib/json";
import { modeOf, normTerms, numOrNull } from "../lib/terms";
import { PERIODS, type BillingPeriod } from "../model/period";
import type { ContractVersion, MyFeatures, PlanContract, PlanFeature } from "../model/features";

// TZ.md §13 / Studio tariffs §6: what the current paid period of the plan gives. The backend is the only limit authority: the counters
// come from it and the phone never decrements them. Nothing here calls POST /subscriptions/me/features/{key}/consume — every limited feature
// the app uses (AI chat requests, AI document analysis, the document constructor, template downloads) is spent by the endpoint that does
// the work, which answers the 402 limit contract itself; consuming in front of it would count one use twice.

const flag = (v: unknown): boolean => v === true;

export function normFeatures(v: unknown): MyFeatures {
  const d = asDict(v);
  const items = asArr(d.items).map((x): PlanFeature => {
    const f = asDict(x);
    const limit = numOrNull(f.limit);
    return {
      key: asStr(f.feature_key),
      mode: modeOf(f.mode, limit, f.allowed),
      allowed: f.allowed !== false,
      limit,
      used: numOrNull(f.used),
      remaining: numOrNull(f.remaining),
      unit: asStr(f.unit),
      resetsAt: asStr(f.resets_at),
    };
  }).filter((f) => f.key);
  return { subscriptionId: asStr(d.subscription_id), planId: asStr(d.plan_id), planVersion: numOrNull(d.plan_version), active: d.active === true, consentRequired: flag(d.renewal_consent_required), items };
}

export const getMyFeatures = async (): Promise<MyFeatures> => normFeatures(await http("/subscriptions/me/features"));

function prices(v: unknown): Partial<Record<BillingPeriod, number>> {
  const out: Partial<Record<BillingPeriod, number>> = {};
  const d = asDict(v);
  for (const p of PERIODS) {
    const n = numOrNull(d[p] ?? d[`${p}_price`]);
    if (n !== null && n > 0) out[p] = n;
  }
  return out;
}

function version(v: unknown, fallback?: unknown): ContractVersion {
  const d = asDict(v);
  const body = asDict(d.payload ?? d.snapshot ?? d);
  const rows = asArr(body.entitlement_contract).length ? body.entitlement_contract : body.entitlements ?? d.entitlements;
  return { version: numOrNull(d.version ?? body.version ?? d.plan_version ?? fallback), terms: normTerms(rows), prices: prices(body.prices ?? d.prices ?? body) };
}

// GET /subscriptions/{id}/contract. The snapshot keeps the terms bought for this period; `current_plan_version` is the newer published
// version the next payment would bring. Consent is asked when the backend marks the subscription `renewal_consent_required` (also as the
// status), or when the terms changed and no consent is on record.
export function normContract(v: unknown, id: string): PlanContract {
  const d = asDict(v);
  const sub = asDict(d.subscription);
  const snap = asDict(d.snapshot);
  const names: Record<string, string> = {};
  for (const [k, n] of Object.entries(asDict(asDict(snap.meta).name))) if (typeof n === "string" && n.trim()) names[k] = n;
  const consent = d.renewal_consent ? asDict(d.renewal_consent) : null;
  const status = asStr(d.status) || asStr(sub.status);
  const own = version(snap, d.plan_version);
  const top = normTerms(d.entitlements);
  const next = d.current_plan_version && typeof d.current_plan_version === "object" ? version(d.current_plan_version) : null;
  const period = asStr(d.billing_period ?? sub.billing_period ?? snap.billing_period);
  return {
    subscriptionId: asStr(d.subscription_id) || id,
    planId: asStr(d.plan_id ?? sub.plan_id ?? snap.plan_id),
    status,
    title: asStr(snap.title),
    names,
    billingPeriod: PERIODS.includes(period as BillingPeriod) ? (period as BillingPeriod) : null,
    ...own,
    terms: top.length ? top : own.terms,
    termsChanged: flag(d.renewal_terms_changed),
    consentRequired: flag(d.renewal_consent_required) || flag(sub.renewal_consent_required) || status === "renewal_consent_required",
    consentAccepted: consent ? (typeof consent.accepted === "boolean" ? consent.accepted : null) : null,
    next: next && (next.terms.length || Object.keys(next.prices).length) ? next : null,
  };
}

export const getContract = async (id: string): Promise<PlanContract> => normContract(await http(`/subscriptions/${encodeURIComponent(id)}/contract`), id);

// The client agrees to the plan's new terms for the next period (the current one keeps its snapshot).
export async function acceptRenewal(id: string): Promise<void> {
  await http(`/subscriptions/${encodeURIComponent(id)}/renewal-consent`, { method: "POST", body: { accepted: true } });
}
