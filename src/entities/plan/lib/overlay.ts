import { getPolicies } from "@/shared/api";
import { asArr, asDict, asNum, asStr } from "@/shared/lib/json";
import type { Plan } from "../model/types";

// The admin overlay on the public tariffs (same as law-main lib/catalogOverlay.ts): GET /platform/policies keeps
// payment.plans.overrides[slug] = { hidden, title, description, audience, *_price, benefits, is_giftable, is_active }.
type Override = Partial<{ hidden: boolean; title: string; description: string; audience: string; monthly: number; six: number; yearly: number; prepaid: number; benefits: string[]; gift: boolean; active: boolean }>;

// Tariffs the backend seeds but the product spec does not list: hidden everywhere unless an admin restores them.
export const LEGACY_PLAN_SLUGS = new Set(["lexgo-ai-yurist-advokat-seller", "lexgo-ai-jismoniy-shaxs", "biznes-abonent-basic", "biznes-abonent-standard", "biznes-abonent-premium"]);

function one(v: unknown): Override {
  const d = asDict(v);
  const o: Override = {};
  if (typeof d.hidden === "boolean") o.hidden = d.hidden;
  if (typeof d.title === "string") o.title = d.title;
  if (typeof d.description === "string") o.description = d.description;
  if (typeof d.audience === "string") o.audience = d.audience;
  if (d.monthly_price != null) o.monthly = asNum(d.monthly_price);
  if (d.six_month_price != null) o.six = asNum(d.six_month_price);
  if (d.yearly_price != null) o.yearly = asNum(d.yearly_price);
  if (d.prepaid_yearly_price != null) o.prepaid = asNum(d.prepaid_yearly_price);
  if (Array.isArray(d.benefits)) o.benefits = asArr(d.benefits).map((x) => asStr(x));
  if (typeof d.is_giftable === "boolean") o.gift = d.is_giftable;
  if (typeof d.is_active === "boolean") o.active = d.is_active;
  return o;
}

/** GET /platform/policies → the per-slug overrides; a failure (guest, offline) means "no overrides". */
export async function getPlanOverrides(): Promise<Record<string, Override>> {
  try {
    const items = await getPolicies();
    const raw = asDict(asDict(asDict(items.payment).plans).overrides);
    return Object.fromEntries(Object.entries(raw).map(([slug, v]) => [slug, one(v)]));
  } catch {
    return {};
  }
}

/** The tariff as customers see it, or null when it is hidden / switched off. */
export function overlayPlan(p: Plan, all: Record<string, Override>): Plan | null {
  const o = all[p.slug];
  if (o?.hidden ?? LEGACY_PLAN_SLUGS.has(p.slug)) return null;
  if (!o) return p;
  const next: Plan = {
    ...p,
    name: o.title ?? p.name,
    description: o.description ?? p.description,
    audience: o.audience ?? p.audience,
    monthlyPrice: o.monthly ?? p.monthlyPrice,
    sixMonthPrice: o.six ?? p.sixMonthPrice,
    yearlyPrice: o.yearly ?? p.yearlyPrice,
    prepaidYearlyPrice: o.prepaid ?? p.prepaidYearlyPrice,
    features: o.benefits ?? p.features,
    isGiftable: o.gift ?? p.isGiftable,
    isActive: o.active ?? p.isActive,
  };
  return next.isActive ? next : null;
}
