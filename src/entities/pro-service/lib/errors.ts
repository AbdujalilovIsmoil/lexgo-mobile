import { ApiError } from "@/shared/api";
import { asArr, asDict } from "@/shared/lib/json";
import { normBand } from "../api/normBand";
import type { PriceBand } from "../model/types";

export type ServiceErrorKind = "range" | "advocateOnly" | "pendingAccount" | "forbidden" | "notFound" | "inactivePromo" | "invalid" | "offline" | "unknown";
export type ServiceError = { kind: ServiceErrorKind; detail: string; limits: PriceBand | null };

// One failed write → what the form should say (statuses as in law-main serviceErrorOf).
export function serviceErrorOf(e: unknown): ServiceError {
  const out = (kind: ServiceErrorKind, limits: PriceBand | null = null): ServiceError => ({ kind, detail: e instanceof ApiError ? (e.detail ?? "") : "", limits });
  if (!(e instanceof ApiError)) return out("unknown");
  if (e.status === 0) return out("offline");
  const detail = asDict(e.data.detail);
  if (e.status === 422) {
    const limits = normBand(detail.pricing_limits ?? detail.limits ?? e.data.pricing_limits ?? detail);
    return limits ? out("range", limits) : out("invalid");
  }
  if (e.status === 400 && asArr(detail.advokat_only_services).length) return out("advocateOnly");
  if (e.status === 403) return out(detail.account_status ? "pendingAccount" : "forbidden");
  if (e.status === 404) return out("notFound");
  if (e.status === 409) return out("inactivePromo");
  return out("unknown");
}
