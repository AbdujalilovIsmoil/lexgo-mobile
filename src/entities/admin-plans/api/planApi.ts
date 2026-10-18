import { ApiError, http } from "@/shared/api";
import { listFrom } from "@/shared/lib/json";
import { isMissingRoute } from "../lib/missingRoute";
import type { Plan, PlanInput, PlanOverride } from "../model/types";
import { normPlan } from "./normPlan";
import { dropPlanOverride, getPlanOverrides, writePlanOverride } from "./overlayApi";

// GET /admin/subscription-plans; the live backend answers 405, then the public list (active plans only) is used.
export async function listPlans(locale: string): Promise<{ plans: Plan[]; activeOnly: boolean }> {
  const ov = await getPlanOverrides();
  let activeOnly = false;
  let data: unknown;
  try {
    data = await http("/admin/subscription-plans");
  } catch (e) {
    if (!isMissingRoute(e) && !(e instanceof ApiError && e.status === 403)) throw e;
    activeOnly = true;
    data = await http("/subscription-plans");
  }
  return { plans: listFrom(data, "plans", "items", "data").map((x) => normPlan(x, locale, ov)), activeOnly };
}

export async function createPlan(b: PlanInput): Promise<void> {
  await http("/admin/subscription-plans", { method: "POST", body: { description: "", benefits: [], is_giftable: false, is_active: true, ...b } });
}

// PATCH /admin/subscription-plans/{id}; overlay fallback only when the route is missing.
export async function updatePlan(p: { id: string; slug: string }, patch: PlanInput): Promise<void> {
  try {
    await http(`/admin/subscription-plans/${encodeURIComponent(p.id)}`, { method: "PATCH", body: patch });
  } catch (e) {
    if (!isMissingRoute(e)) throw e;
    await writePlanOverride(p.slug, patch as PlanOverride);
  }
}

// DELETE /admin/subscription-plans/{id} (soft delete on the backend); overlay-hide when the route is missing.
export async function deletePlan(p: { id: string; slug: string }): Promise<void> {
  try {
    await http(`/admin/subscription-plans/${encodeURIComponent(p.id)}`, { method: "DELETE" });
  } catch (e) {
    if (!isMissingRoute(e)) throw e;
    await writePlanOverride(p.slug, { hidden: true });
  }
}

export const restorePlan = (slug: string) => writePlanOverride(slug, { hidden: false });
export const resetPlan = (slug: string) => dropPlanOverride(slug);
