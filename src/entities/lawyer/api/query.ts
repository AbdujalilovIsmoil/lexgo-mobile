import type { LawyerFilters } from "../model/filters";

// Query string of GET /marketplace/lawyers. `sort=rating` is not sent (500) and
// `min_experience` does not exist on the server, so both are applied on the device.
export function buildQuery(f: Partial<LawyerFilters>, limit: number, offset: number): string {
  const qs = new URLSearchParams({ limit: String(limit), offset: String(offset), sort: f.sort && f.sort !== "rating" ? f.sort : "recommended" });
  if (f.kind && f.kind !== "all") qs.set("seller_type", f.kind);
  if (f.region) qs.set("region", f.region);
  if (f.area) qs.set("specialization", f.area);
  if (f.category) qs.set("category_id", f.category);
  if (f.service) qs.set("service_id", f.service);
  if (f.minRating) qs.set("min_rating", String(f.minRating));
  if (f.maxPrice) qs.set("price_max", String(f.maxPrice));
  if (f.q?.trim()) qs.set("q", f.q.trim());
  return qs.toString();
}

// Filters the server cannot apply: the whole result is read and cut here.
export const isLocalMode = (f: Partial<LawyerFilters>): boolean => f.sort === "rating" || (f.minExp ?? 0) > 0;
