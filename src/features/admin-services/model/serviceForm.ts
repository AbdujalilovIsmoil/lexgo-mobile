import type { AdminService, Passport, ServiceMetaInput, ServiceUpdate } from "@/entities/admin-services";

export type FormVals = {
  title: string; category_id: string; description: string; base_price: string; currency: string; delivery_minutes: string; is_active: boolean;
  title_uz_latn: string; title_uz_cyrl: string; title_ru: string; executor_type: string; advokat_required: boolean;
  pricing_tier: string; standard_price: string; sla_code: string; refund_code: string; ai_category: string;
};

const whole = (n?: number) => (n == null || !Number.isFinite(n) ? "" : String(Math.round(n)));

// Form values from the list row, refined by the passport (fresher catalogue metadata) when the service has a metadata row.
export function seedFrom(s: AdminService, p: Passport | null): FormVals {
  const m = s.hasMetadata ? p : null;
  return {
    title: s.title || s.name, category_id: s.categoryId, description: s.description, base_price: whole(s.basePrice), currency: s.currency || "UZS",
    delivery_minutes: whole(s.deliveryMinutes), is_active: s.isActive, title_uz_latn: s.titleUzLatn, title_uz_cyrl: s.titleUzCyrl, title_ru: s.titleRu,
    executor_type: m?.executorType || s.executorType, advokat_required: m ? m.advokatRequired : s.advokatRequired, pricing_tier: m?.pricingTier || s.pricingTier,
    standard_price: whole(m?.standardPrice ?? s.standardPrice), sla_code: m?.slaCode || s.slaCode, refund_code: m?.refundCode || s.refundCode, ai_category: m?.aiCategory || s.aiCategory,
  };
}

// "" counts as 0; anything that is not a non-negative integer is invalid (null).
export function parseWhole(v: string): number | null {
  const s = v.trim();
  return s === "" ? 0 : /^\d+$/.test(s) ? parseInt(s, 10) : null;
}

const META_TEXT = ["title_uz_latn", "title_uz_cyrl", "title_ru", "executor_type", "pricing_tier", "sla_code", "refund_code", "ai_category"] as const;

// Only the changed fields; the metadata block only for services that have a metadata row.
export function diffForm(init: FormVals, v: FormVals, hasMetadata: boolean): ServiceUpdate | "bad-number" {
  const out: ServiceUpdate = {};
  if (v.title.trim() !== init.title) out.title = v.title.trim();
  if (v.category_id && v.category_id !== init.category_id) out.category_id = v.category_id;
  if (v.description !== init.description) out.description = v.description;
  if (v.currency !== init.currency) out.currency = v.currency;
  if (v.is_active !== init.is_active) out.is_active = v.is_active;
  for (const k of ["base_price", "delivery_minutes"] as const) {
    if (v[k].trim() === init[k]) continue;
    const n = parseWhole(v[k]);
    if (n == null) return "bad-number";
    out[k] = n;
  }
  if (!hasMetadata) return out;
  const meta: ServiceMetaInput = {};
  for (const k of META_TEXT) if (v[k].trim() !== init[k]) meta[k] = v[k].trim();
  if (v.advokat_required !== init.advokat_required) meta.advokat_required = v.advokat_required;
  if (v.standard_price.trim() !== init.standard_price) {
    const n = parseWhole(v.standard_price);
    if (n == null) return "bad-number";
    meta.standard_price = n;
  }
  return Object.keys(meta).length ? { ...out, metadata: meta } : out;
}
