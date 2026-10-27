// Business errors of the promotion checkout and the banner upload that the screen explains in its own words: the web's list, the
// locale check (422) and the marketplace advertising gate (409, TZ.md "Seller checkout gate").
export const PROMOTION_ERRORS = [
  "promotion_already_exists",
  "promotion_package_placement_mismatch",
  "service_id_required",
  "service_id_not_allowed",
  "promotion_days_invalid",
  "promotion_seller_not_verified",
  "promotion_placement_invalid",
  "promotion_language_invalid",
  "marketplace_advertising_not_active",
  "marketplace_advertising_not_ready",
] as const;
export type PromotionErrorCode = (typeof PROMOTION_ERRORS)[number];

type Failure = { status?: number; code?: string; detail?: string; data?: Record<string, unknown> };
const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");
const detailOf = (e: unknown): Record<string, unknown> => {
  const d = e && typeof e === "object" ? (e as Failure).data?.detail : undefined;
  return d && typeof d === "object" && !Array.isArray(d) ? (d as Record<string, unknown>) : {};
};

/** The known business code of a failed checkout ("" when it is something else). */
export function promotionErrorCode(e: unknown): PromotionErrorCode | "" {
  if (!e || typeof e !== "object") return "";
  const f = e as Failure;
  const inner = detailOf(e);
  const code = str(f.code) || str(inner.code) || str(inner.error) || str(f.detail);
  return (PROMOTION_ERRORS as readonly string[]).includes(code) ? (code as PromotionErrorCode) : "";
}

/** Why marketplace advertising is closed (409 marketplace_advertising_not_active): its `detail.mode`, "test" or "paused"; "" otherwise. */
export function advertisingMode(e: unknown): "test" | "paused" | "" {
  const mode = str(detailOf(e).mode).toLowerCase();
  return mode === "test" || mode === "paused" ? mode : "";
}

/** A lost answer, a server fault or throttling may be retried with the same idempotency key; other answers need a new request. */
export function isRetryable(e: unknown): boolean {
  const status = e && typeof e === "object" ? (e as Failure).status : undefined;
  return typeof status !== "number" || status === 0 || status >= 500 || status === 408 || status === 429;
}
