import { http } from "@/shared/api";
import { asArr, asDict, asStr, listFrom, uzs } from "@/shared/lib/json";
import type { ServicePackage } from "../model/types";

// GET /service-packages — every tariff of every package (same mapping as the web's getServicePackages).
export async function listPackages(): Promise<ServicePackage[]> {
  const data = await http("/service-packages");
  return listFrom(data, "packages", "items", "data").map((v) => {
    const d = asDict(v);
    return {
      id: asStr(d.id),
      code: asStr(d.package_code ?? d.code),
      title: asStr(d.title ?? d.name),
      tariff: asStr(d.tariff).toUpperCase(),
      price: uzs(d, "price", "standard_price"),
      slug: asStr(d.slug),
      categoryTitle: asStr(d.category_title),
      relatedServiceCodes: asStr(d.related_service_codes),
      duration: asStr(d.duration),
      result: asStr(d.result),
      included: asArr(d.included).map((x) => asStr(x)),
      excluded: asArr(d.excluded).map((x) => asStr(x)),
      active: d.is_active !== false,
    };
  });
}
