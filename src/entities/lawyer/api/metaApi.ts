import { http } from "@/shared/api";
import { asArr, asDict, asStr, uzs } from "@/shared/lib/json";
import { cleanTitle } from "../lib/cleanTitle";
import type { MarketBrowse, MarketMeta } from "../model/marketTypes";
import { normLawyer } from "./normalize";
import { buildQuery } from "./query";

function normMeta(v: unknown): MarketMeta {
  const d = asDict(v);
  const seen = new Set<string>();
  return {
    categories: asArr(d.categories).map((c) => ({ id: asStr(asDict(c).id), title: cleanTitle(asStr(asDict(c).title ?? asDict(c).name)), slug: asStr(asDict(c).slug) })).filter((c) => c.id && c.title),
    services: asArr(d.services)
      .map((x) => ({ id: asStr(asDict(x).id), title: cleanTitle(asStr(asDict(x).title)), categoryId: asStr(asDict(x).category_id), basePrice: uzs(asDict(x), "base_price") }))
      .filter((s) => s.id && s.title && !seen.has(s.id) && (seen.add(s.id), true)),
  };
}

// GET /marketplace/meta — categories and services the filters can offer.
export const getMarketMeta = async (): Promise<MarketMeta> => normMeta(await http("/marketplace/meta"));

// GET /marketplace/lawyers?include_meta=true — the first 100 verified specialists with the catalogue's services, as the web's service browser reads them.
export async function getMarketBrowse(): Promise<MarketBrowse> {
  const d = asDict(await http(`/marketplace/lawyers?${buildQuery({}, 100, 0)}&include_meta=true`));
  return { sellers: asArr(d.items).map(normLawyer).filter((l) => l.userId && l.name && l.verified), meta: normMeta(d.meta) };
}
