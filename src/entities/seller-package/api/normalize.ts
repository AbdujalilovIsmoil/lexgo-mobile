import { asArr, asDict, asStr, uzs } from "@/shared/lib/json";
import type { PackTier, SellerPackage } from "../model/types";

const text = (v: unknown): string => (typeof v === "string" ? v : asStr(asDict(v).message ?? asDict(v).text ?? asDict(v).title));

// Every human-readable line of an `eligibility` value: reasons[], reason, message, requirements[], missing[].
export function reasonsOf(v: unknown): string[] {
  if (typeof v === "string") return v.trim() ? [v.trim()] : [];
  const d = asDict(v);
  const lists = ["reasons", "requirements", "missing", "messages"].flatMap((k) => asArr(d[k]).map(text));
  return [...lists, text(d.reason), text(d.message)].map((x) => x.trim()).filter((x, i, a) => x && a.indexOf(x) === i);
}

const okOf = (v: unknown): boolean => { const d = asDict(v); return d.eligible !== false && d.is_eligible !== false && d.available !== false; };

function normTier(v: unknown): PackTier {
  const d = asDict(v);
  return { tier: asStr(d.tier ?? d.tariff).toUpperCase(), title: asStr(d.title), price: uzs(d, "price"), duration: asStr(d.duration), included: asArr(d.included).map(text).filter(Boolean), eligible: okOf(d.eligibility), reasons: reasonsOf(d.eligibility) };
}

export function normPackage(v: unknown): SellerPackage {
  const d = asDict(v);
  const pk = asDict(d.package);
  const g = (k: string) => d[k] ?? pk[k];
  const status = asStr(d.status ?? asDict(d.seller_package).status).toLowerCase();
  return {
    id: asStr(g("id") ?? d.package_id),
    code: asStr(g("package_code") ?? g("code")),
    title: asStr(g("title")),
    description: asStr(g("description") ?? g("client_value")),
    category: asStr(g("category_title")),
    enabled: d.enabled === true || d.is_enabled === true,
    status,
    priceEditable: d.price_editable === true,
    eligible: okOf(d.eligibility),
    reasons: reasonsOf(d.eligibility),
    tiers: asArr(g("tiers")).map(normTier),
    items: [...asArr(g("components")).map((c) => text(asDict(c).title ?? asDict(c).service_title ?? asDict(c).service_id)), ...asArr(g("custom_items")).map(text)].filter(Boolean),
  };
}
