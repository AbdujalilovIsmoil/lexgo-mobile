import { asArr, asDict, asNum, asStr, uzs } from "@/shared/lib/json";
import { cleanDocTitle } from "@/shared/lib/doc/cleanTitle";
import type { Service, ServiceCategory } from "../model/types";

function title(d: Record<string, unknown>, locale: string): string {
  const byLocale = locale === "ru" ? d.title_ru : d.title_uz_latn;
  const raw = asStr(byLocale) || asStr(d.title ?? d.name); // the passport sends "" for a missing translation
  return cleanDocTitle(raw) || raw;
}

export function normService(v: unknown, locale = "uz"): Service {
  const d = asDict(v);
  const price = uzs(d, "standard_price", "base_price", "price");
  return {
    id: asStr(d.id),
    name: title(d, locale),
    slug: asStr(d.slug),
    categoryId: asStr(d.category_id ?? d.categoryId) || undefined,
    categoryTitle: asStr(d.category_title) || undefined,
    subcategory: asStr(d.subcategory) || undefined,
    catalogCode: asStr(d.catalog_code) || undefined,
    price: price > 0 ? price : undefined,
    currency: asStr(d.currency, "UZS"),
    free: asStr(d.pricing_tier) === "free",
    deliveryMinutes: asNum(d.delivery_minutes),
    description: asStr(d.description) || undefined,
    isActive: d.is_active !== false,
    advokatRequired: Boolean(d.advokat_required),
    executorType: asStr(d.executor_type) || undefined,
    documentTemplateId: asStr(d.document_template_id) || undefined,
  };
}

export function normCategory(v: unknown): ServiceCategory {
  const d = asDict(v);
  const subs = asArr(d.subcategories)
    .map((x) => {
      const w = asDict(x);
      const samples = asArr(w.sample_services).map((y) => cleanDocTitle(asStr(asDict(y).title))).filter(Boolean).slice(0, 3);
      return { title: cleanDocTitle(asStr(w.title ?? w.name)), servicesCount: asNum(w.services_count), samples };
    })
    .filter((x) => x.title);
  return {
    id: asStr(d.id),
    name: asStr(d.title ?? d.name),
    slug: asStr(d.slug),
    description: asStr(d.description),
    servicesCount: asNum(d.services_count),
    subcategoriesCount: asNum(d.subcategories_count, subs.length),
    subcategories: subs,
  };
}
