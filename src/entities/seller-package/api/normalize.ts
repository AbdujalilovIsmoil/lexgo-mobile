import { asArr, asDict, asStr, uzs } from "@/shared/lib/json";
import type { PackageEligibility, SellerPackage } from "../model/types";

const strs = (v: unknown): string[] => asArr(v).map((x) => asStr(x)).filter(Boolean);

function normEligibility(v: unknown): PackageEligibility {
  const d = asDict(v);
  return { eligible: d.eligible !== false, extendedVerified: d.extended_verified === true, baseVerified: d.base_verified === true, reasons: strs(d.reasons), missingServiceIds: strs(d.missing_service_ids) };
}

// One /lawyers/me/packages/manage row (same mapping as the web): the package may be nested under `package` / `service_package`.
export function normPackage(v: unknown): SellerPackage {
  const a = asDict(v);
  const nested = asDict(a.package ?? a.service_package);
  const hasNested = Object.keys(nested).length > 0;
  const d = hasNested ? nested : a;
  const enabled = a.enabled === true || a.is_enabled === true;
  const raw = asStr(a.status ?? a.seller_status).toLowerCase();
  const code = asStr(d.package_code ?? d.code);
  const title = asStr(d.title ?? d.name);
  const id = asStr(hasNested ? (d.id ?? a.package_id) : (a.package_id ?? a.id)) || asStr(a.package_id ?? a.id);
  return {
    id,
    pkg: {
      id,
      code,
      groupCode: asStr(d.group_code ?? d.package_code ?? d.code),
      groupTitle: asStr(d.group_title ?? d.title ?? d.name),
      title,
      category: asStr(d.category_title),
      tariff: asStr(d.tariff).toUpperCase(),
      price: uzs(d, "price", "standard_price"),
      duration: asStr(d.duration),
      included: strs(d.included),
    },
    enabled,
    status: enabled && (raw === "" || raw === "active" || raw === "enabled") ? "active" : "disabled",
    priceEditable: a.price_editable === true,
    eligibility: normEligibility(a.eligibility ?? a.package_eligibility),
  };
}
