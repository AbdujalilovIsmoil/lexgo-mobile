import { ApiError } from "@/shared/api";
import { asArr, asDict, asStr, uzs } from "@/shared/lib/json";
import type { ServiceError } from "../model/serviceTypes";
import { normBand } from "./normService";

const base = (kind: ServiceError["kind"], message = "", rest: Partial<ServiceError> = {}): ServiceError => ({ kind, min: 0, max: 0, band: null, message, ...rest });

// Maps a failed manage call to something the form can explain (422 range, advocate-only, 403 …).
export function serviceErrorOf(e: unknown): ServiceError {
  if (!(e instanceof ApiError)) return base("other");
  const detail = asDict(asDict(e.data).detail);
  if (e.status === 422 && ("min_allowed" in detail || "pricing_limits" in detail)) {
    const band = normBand(detail.pricing_limits) ?? normBand(detail);
    return base("range", e.detail, { min: uzs(detail, "min_allowed") || band?.min || 0, max: uzs(detail, "max_allowed") || band?.max || 0, band });
  }
  if (e.status === 400 && asArr(detail.advokat_only_services).length) return base("advocateOnly");
  if (e.status === 403) return base(asStr(detail.code) === "promotion_seller_not_verified" || detail.account_status ? "unverified" : "forbidden", e.detail);
  if (e.status === 404) return base("notFound", e.detail);
  return base("other", e.detail);
}
