import { ApiError } from "@/shared/api";
import { asArr, asDict } from "@/shared/lib/json";
import { rulesBlockOf } from "@/entities/service-rules/lib/normalize";
import { normBand } from "../api/normBand";
import type { PriceBand } from "../model/types";

export type ServiceErrorKind = "range" | "noPrice" | "advocateOnly" | "pendingAccount" | "forbidden" | "notFound" | "rules" | "conflict" | "invalid" | "offline" | "unknown";
// `missing`: for "rules", the rule ids the refusal named.
export type ServiceError = { kind: ServiceErrorKind; detail: string; limits: PriceBand | null; missing: string[] };

// One failed write → what the form should say (statuses as in law-main serviceErrorOf; a 409 branches on detail.code, TZ.md §18).
export function serviceErrorOf(e: unknown): ServiceError {
  const out = (kind: ServiceErrorKind, limits: PriceBand | null = null, missing: string[] = []): ServiceError => ({ kind, detail: e instanceof ApiError ? (e.detail ?? "") : "", limits, missing });
  if (!(e instanceof ApiError)) return out("unknown");
  if (e.status === 0) return out("offline");
  const rules = rulesBlockOf(e);
  if (rules) return out("rules", null, rules);
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
  if (e.status === 409) return out("conflict"); // someone else changed it: the list is read again
  return out("unknown");
}

// i18n key of the text for a failed write (namespace proSvc; the rules and conflict texts live with the configuration).
export const serviceErrorKey = (kind: ServiceErrorKind): string => (kind === "rules" ? "svcRules.rulesLockReason" : kind === "conflict" ? "scfg.errConflict" : `proSvc.errors.${kind}`);
