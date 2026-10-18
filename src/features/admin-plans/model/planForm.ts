import { planAudience, planPrice, pricesFor, primaryPeriod, type BillingPeriod, type Plan, type PlanInput } from "@/entities/admin-plans";

export type FormAudience = "client" | "yurist" | "advokat" | "seller";
export type FormVals = {
  title: string; slug: string; audience: FormAudience; targetRoles: string[]; autoChargeProvider: string; billingType: string; sortOrder: string;
  giftDurations: string; period: BillingPeriod; price: string; description: string; benefits: string; isGiftable: boolean; isActive: boolean;
};

export const TARGET_ROLES = ["client", "yurist", "advokat"];
export const FORM_AUDIENCES: FormAudience[] = ["client", "yurist", "advokat", "seller"];
const defaultRoles = (a: FormAudience) => (a === "seller" ? ["yurist", "advokat"] : [a]);
const toList = (v: string) => v.split(/[\n,]/).map((s) => s.trim()).filter(Boolean);

export function seedVals(p?: Plan): FormVals {
  if (!p) {
    return { title: "", slug: "", audience: "client", targetRoles: ["client"], autoChargeProvider: "atmos", billingType: "subscription", sortOrder: "", giftDurations: "", period: "monthly", price: "", description: "", benefits: "", isGiftable: false, isActive: true };
  }
  const period = primaryPeriod(p);
  const a = planAudience(p);
  const audience: FormAudience = a.includes("yurist") && a.includes("advokat") ? "seller" : a[0] === "business" ? "client" : (a[0] ?? "client");
  const roles = p.targetRoles.filter((r) => TARGET_ROLES.includes(r));
  return {
    title: p.title || p.name, slug: p.slug, audience, targetRoles: roles.length ? roles : defaultRoles(audience), autoChargeProvider: p.autoChargeProvider || "atmos",
    billingType: p.billingType || "subscription", sortOrder: p.sortOrder ? String(p.sortOrder) : "", giftDurations: p.allowedGiftDurations.join(", "), period,
    price: planPrice(p, period) ? String(Math.round(planPrice(p, period))) : "", description: p.description, benefits: p.benefits.join("\n"), isGiftable: p.isGiftable, isActive: p.isActive,
  };
}

// The request body shared by create and edit (other billing periods keep the plan's own prices).
export function toBody(v: FormVals, plan?: Plan): PlanInput {
  return {
    slug: v.slug.trim(), title: v.title.trim(), description: v.description.trim(), audience: v.audience, target_roles: v.targetRoles,
    auto_charge_provider: v.autoChargeProvider.trim() || undefined, billing_type: v.billingType.trim() || undefined, sort_order: parseInt(v.sortOrder, 10) || 0,
    allowed_gift_durations: toList(v.giftDurations).map((s) => parseInt(s, 10)).filter((n) => Number.isFinite(n)),
    ...pricesFor(v.period, parseInt(v.price, 10) || 0, plan), benefits: toList(v.benefits), is_giftable: v.isGiftable, is_active: v.isActive,
  };
}
