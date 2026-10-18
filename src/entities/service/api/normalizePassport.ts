import { asArr, asDict, asStr } from "@/shared/lib/json";
import { cleanDocTitle } from "@/shared/lib/doc/cleanTitle";
import type { ServicePassport } from "../model/passportTypes";

const text = (v: unknown) => cleanDocTitle(asStr(v));

export function normPassport(v: unknown): ServicePassport {
  const d = asDict(v);
  const price = Number(d.standard_price);
  return {
    catalogCode: asStr(d.catalog_code),
    family: text(d.family),
    group: text(d.group),
    subcategory: text(d.subcategory),
    executorType: asStr(d.executor_type),
    advokatRequired: Boolean(d.advokat_required),
    format: asStr(d.format).trim(),
    standardDuration: asStr(d.standard_duration).trim(),
    urgentDuration: asStr(d.urgent_duration).trim(),
    requiredDocuments: asArr(d.required_documents).map((x) => text(x)).filter(Boolean),
    pricingTier: asStr(d.pricing_tier),
    standardPrice: Number.isFinite(price) ? price : undefined,
    refundCode: asStr(d.refund_code),
    slaCode: asStr(d.sla_code),
    aiCategory: asStr(d.ai_category),
    version: asStr(d.version),
  };
}
