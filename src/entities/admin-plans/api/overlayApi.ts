import { asArr, asDict, asNum, asStr } from "@/shared/lib/json";
import type { PlanOverride } from "../model/types";
import { getAdminPolicies, getPolicies, putAdminPolicy } from "./policyApi";

// Plans the backend seeds but the product spec does not list: hidden unless an admin restores them.
export const LEGACY_PLAN_SLUGS = new Set(["lexgo-ai-yurist-advokat-seller", "lexgo-ai-jismoniy-shaxs", "biznes-abonent-basic", "biznes-abonent-standard", "biznes-abonent-premium"]);

// Admin edits live as an overlay in the `payment` policy: payment.plans.overrides[slug] (shared with the web panel).
const overrides = (payment: Record<string, unknown>) => asDict(asDict(payment.plans).overrides);

function normOverride(v: unknown): PlanOverride {
  const d = asDict(v);
  const o: PlanOverride = {};
  if (typeof d.hidden === "boolean") o.hidden = d.hidden;
  for (const k of ["title", "description", "audience"] as const) if (typeof d[k] === "string") o[k] = asStr(d[k]);
  for (const k of ["monthly_price", "six_month_price", "yearly_price", "prepaid_yearly_price"] as const) if (d[k] != null) o[k] = asNum(d[k]);
  if (Array.isArray(d.benefits)) o.benefits = asArr(d.benefits).map((x) => asStr(x));
  for (const k of ["is_giftable", "is_active"] as const) if (typeof d[k] === "boolean") o[k] = d[k];
  return o;
}

export async function getPlanOverrides(): Promise<Record<string, PlanOverride>> {
  try {
    return Object.fromEntries(Object.entries(overrides((await getPolicies()).payment ?? {})).map(([slug, v]) => [slug, normOverride(v)]));
  } catch {
    return {};
  }
}

async function write(change: (o: Record<string, unknown>) => Record<string, unknown>): Promise<void> {
  const payment = (await getAdminPolicies()).payment ?? {};
  const plans = asDict(payment.plans);
  await putAdminPolicy("payment", { ...payment, plans: { ...plans, overrides: change({ ...overrides(payment) }) } });
}

export const writePlanOverride = (slug: string, patch: PlanOverride) => write((o) => ({ ...o, [slug]: { ...asDict(o[slug]), ...patch } }));
// Drop every admin change; a legacy plan gets an explicit hidden:false (same as the web panel).
export const dropPlanOverride = (slug: string) => write((o) => { delete o[slug]; if (LEGACY_PLAN_SLUGS.has(slug)) o[slug] = { hidden: false }; return o; });
