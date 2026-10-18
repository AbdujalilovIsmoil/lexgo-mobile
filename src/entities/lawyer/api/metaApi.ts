import { http } from "@/shared/api";
import { asArr, asDict, asStr, uzs } from "@/shared/lib/json";
import { cleanTitle } from "../lib/cleanTitle";
import type { MarketMeta } from "../model/marketTypes";

// GET /marketplace/meta — categories and services the filters can offer.
export async function getMarketMeta(): Promise<MarketMeta> {
  const d = asDict(await http("/marketplace/meta"));
  const seen = new Set<string>();
  return {
    categories: asArr(d.categories).map((c) => ({ id: asStr(asDict(c).id), title: cleanTitle(asStr(asDict(c).title ?? asDict(c).name)) })).filter((c) => c.id && c.title),
    services: asArr(d.services)
      .map((x) => ({ id: asStr(asDict(x).id), title: cleanTitle(asStr(asDict(x).title)), categoryId: asStr(asDict(x).category_id), basePrice: uzs(asDict(x), "base_price") }))
      .filter((s) => s.id && s.title && !seen.has(s.id) && (seen.add(s.id), true)),
  };
}
