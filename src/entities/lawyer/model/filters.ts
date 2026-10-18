// Sort values the backend understands. "rating" is sorted locally because the
// server answers 500 for sort=rating.
export type LawyerSort = "recommended" | "rating" | "experience" | "price_asc";
export type SellerKind = "all" | "advokat" | "yurist";

export type LawyerFilters = {
  q: string;
  kind: SellerKind;
  region: string; // backend region key, "" = any
  area: string; // specialization key, "" = any
  category: string; // service category id, "" = any
  service: string; // marketplace service id, "" = any
  sort: LawyerSort;
  minRating: number; // 0 = any
  maxPrice: number; // 0 = any
  minExp: number; // years, 0 = any (applied on the device)
};

export const defaultLawyerFilters: LawyerFilters = { q: "", kind: "all", region: "", area: "", category: "", service: "", sort: "recommended", minRating: 0, maxPrice: 0, minExp: 0 };

// Number of filters the user changed (search text and sort are not counted).
export const activeFilterCount = (f: LawyerFilters): number =>
  [f.kind !== "all", !!f.region, !!f.area, !!f.category, !!f.service, f.minRating > 0, f.maxPrice > 0, f.minExp > 0].filter(Boolean).length;
