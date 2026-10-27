import { http } from "@/shared/api";
import { asArr, asDict, asNum, listFrom } from "@/shared/lib/json";
import { normLawyer } from "./normalize";
import { hasPromoTarget, normPromo } from "./normPromo";
import { buildQuery, isLocalMode } from "./query";
import type { Lawyer } from "../model/types";
import type { LawyerFilters } from "../model/filters";
import type { PromoSurface } from "../model/marketTypes";

// `banners`: the top banners the list sends along (the rail's fallback). Boosted profiles need no list of their own: those sellers come
// in `items` with their promotion and show as TOP cards.
export type LawyerPage = { items: Lawyer[]; total: number; banners: PromoSurface[] };
export type PageOpts = { limit?: number; offset?: number };

const MAX = 100; // server limit per request

// Public marketplace shows only LexGo-verified professionals (`is_verified`, TZ.md public lawyer privacy).
async function fetchPage(f: Partial<LawyerFilters>, limit: number, offset: number): Promise<LawyerPage> {
  const data = await http(`/marketplace/lawyers?${buildQuery(f, limit, offset)}`);
  const d = asDict(data);
  const items = listFrom(data, "items", "data", "lawyers").map(normLawyer).filter((l) => l.userId && l.name && l.verified);
  if (f.sort === "price_asc") items.sort((a, b) => (a.basePrice || Infinity) - (b.basePrice || Infinity)); // no price → last
  const banners = asArr(d.banners).map(normPromo).filter((p) => hasPromoTarget(p) && (!p.placement || p.placement === "banner"));
  return { items, total: asNum(d.total, items.length), banners };
}

// Whole result for a local sort/filter: read once per minute and cut into pages here.
const whole = new Map<string, { at: number; page: Promise<LawyerPage> }>();
function fetchAll(f: Partial<LawyerFilters>): Promise<LawyerPage> {
  const key = buildQuery({ ...f, sort: "recommended" }, MAX, 0);
  const hit = whole.get(key);
  if (hit && Date.now() - hit.at < 60_000) return hit.page;
  const load = async (): Promise<LawyerPage> => {
    const first = await fetchPage(f, MAX, 0);
    const items = [...first.items];
    for (let off = MAX; off < first.total && off < 500; off += MAX) items.push(...(await fetchPage(f, MAX, off)).items);
    return { ...first, items };
  };
  const page = load();
  whole.set(key, { at: Date.now(), page });
  page.catch(() => whole.delete(key));
  return page;
}

export async function listLawyers(f: Partial<LawyerFilters> = {}, { limit = MAX, offset = 0 }: PageOpts = {}): Promise<LawyerPage> {
  if (!isLocalMode(f)) return fetchPage(f, limit, offset);
  const all = await fetchAll(f);
  let items = all.items.filter((l) => l.experienceYears >= (f.minExp ?? 0));
  if (f.sort === "rating") items = [...items].sort((a, b) => b.rating - a.rating || b.reviews - a.reviews);
  return { ...all, items: items.slice(offset, offset + limit), total: items.length };
}
