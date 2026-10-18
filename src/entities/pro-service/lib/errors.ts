import { ApiError } from "@/shared/api";
import { asArr, asDict } from "@/shared/lib/json";
import { normBand } from "../api/normBand";
import type { PriceBand } from "../model/types";

export type ServiceErrorKind = "range" | "noPrice" | "advocateOnly" | "pendingAccount" | "forbidden" | "notFound" | "inactivePromo" | "invalid" | "offline" | "unknown";
export type ServiceError = { kind: ServiceErrorKind; detail: string; limits: PriceBand | null };

// One failed write → what the form should say (statuses as in law-main serviceErrorOf).
export function serviceErrorOf(e: unknown): ServiceError {
  const out = (kind: ServiceErrorKind, limits: PriceBand | null = null): ServiceError => ({ kind, detail: e instanceof ApiError ? (e.detail ?? "") : "", limits });
  if (!(e instanceof ApiError)) return out("unknown");
  if (e.status === 0) return out("offline");
  const detail = asDict(e.data.detail);
  if (e.status === 422) {
    const raw = detail.pricing_limits ?? detail.limits ?? e.data.pricing_limits ?? detail;
    const limits = normBand(raw);
    if (limits) return out("range", limits);
    const r = asDict(raw);
    return "max_allowed" in r || "max_price" in r ? out("noPrice") : out("invalid"); // a zero ceiling = the catalogue has no price
  }
  if (e.status === 400 && asArr(detail.advokat_only_services).length) return out("advocateOnly");
  if (e.status === 403) return out(detail.account_status ? "pendingAccount" : "forbidden");
  if (e.status === 404) return out("notFound");
  if (e.status === 409) return out("inactivePromo");
  return out("unknown");
}

// i18n key (namespace proSvc) of the text for a failed write; an org owner editing a member's service gets the "Owner" wording.
export function serviceErrorKey(kind: ServiceErrorKind, owner: boolean): string {
  if (kind === "pendingAccount" || kind === "forbidden") return `proSvc.errors.${kind}${owner ? "Owner" : ""}`;
  return `proSvc.errors.${kind}`;
}
