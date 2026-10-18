// Business errors of POST /promotions/checkout that the screen explains in its own words (the same list as the web).
export const PROMOTION_ERRORS = [
  "promotion_already_exists",
  "promotion_package_placement_mismatch",
  "service_id_required",
  "service_id_not_allowed",
  "promotion_days_invalid",
  "promotion_seller_not_verified",
  "promotion_placement_invalid",
] as const;
export type PromotionErrorCode = (typeof PROMOTION_ERRORS)[number];

type Failure = { status?: number; code?: string; detail?: string; data?: Record<string, unknown> };
const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

/** The known business code of a failed checkout ("" when it is something else). */
export function promotionErrorCode(e: unknown): PromotionErrorCode | "" {
  if (!e || typeof e !== "object") return "";
  const f = e as Failure;
  const d = f.data?.detail;
  const inner = d && typeof d === "object" ? (d as Record<string, unknown>) : {};
  const code = str(f.code) || str(inner.code) || str(inner.error) || str(f.detail);
  return (PROMOTION_ERRORS as readonly string[]).includes(code) ? (code as PromotionErrorCode) : "";
}

/** A lost answer, a server fault or throttling may be retried with the same idempotency key; other answers need a new request. */
export function isRetryable(e: unknown): boolean {
  const status = e && typeof e === "object" ? (e as Failure).status : undefined;
  return typeof status !== "number" || status === 0 || status >= 500 || status === 408 || status === 429;
}
