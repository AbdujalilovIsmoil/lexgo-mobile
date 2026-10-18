import { http } from "@/shared/api";
import { listFrom } from "@/shared/lib/json";
import type { Plan } from "../model/types";
import { getPlanOverrides, overlayPlan } from "../lib/overlay";
import { normPlan } from "./normPlan";

// GET /subscription-plans (public, so guests can browse) with the admin overlay of GET /platform/policies applied:
// the legacy tariffs are hidden and edited titles, prices and benefits show up, exactly as on the web.
export async function listPlans(locale = "uz"): Promise<Plan[]> {
  const [data, ov] = await Promise.all([http("/subscription-plans", { auth: false }), getPlanOverrides()]);
  return listFrom(data, "plans", "items", "data")
    .map((v) => overlayPlan(normPlan(v, locale), ov))
    .filter((p): p is Plan => !!p && p.isActive && !!p.name)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.monthlyPrice - b.monthlyPrice);
}

// GET /subscription-plans/{id or slug}
export async function getPlan(idOrSlug: string, locale = "uz"): Promise<Plan> {
  return normPlan(await http(`/subscription-plans/${encodeURIComponent(idOrSlug)}`, { auth: false }), locale);
}
