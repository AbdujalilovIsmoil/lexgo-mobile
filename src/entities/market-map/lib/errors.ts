import { ApiError } from "@/shared/api";

// Map / location / navigation error codes from the contract; each has its own localized message (mmap.err.<code>).
export const MAP_CODES = [
  "client_location_consent_required", "location_consent_duration_invalid", "coordinates_required", "coordinates_invalid", "radius_invalid",
  "seller_type_invalid", "subcategory_category_mismatch", "service_not_found", "category_not_found", "subcategory_not_found", "seller_not_found",
  "paid_order_not_found", "active_paid_order_required", "paid_order_live_location_unavailable", "public_office_navigation_unavailable",
  "navigation_destination_unavailable", "geocoder_rate_limit_exceeded", "yandex_geocoder_not_configured", "yandex_geocoder_key_invalid",
  "yandex_geocoder_unavailable", "location_duration_invalid", "location_source_invalid",
] as const;
export type MapCode = (typeof MAP_CODES)[number];

export const codeOf = (e: unknown): string => (e instanceof ApiError ? e.code ?? (e.detail && /^[a-z_]+$/.test(e.detail) ? e.detail : "") : "");

// The i18n key to show for a failure: the code's own text when we know it, otherwise a safe text by HTTP status — never a raw backend code.
export function mapErrorKey(e: unknown): string {
  const code = codeOf(e);
  if ((MAP_CODES as readonly string[]).includes(code)) return `mmap.err.${code}`;
  const s = e instanceof ApiError ? e.status : -1;
  if (s === 0) return "mmap.err.offline";
  if (s === 401) return "mmap.err.auth";
  if (s === 403) return "mmap.err.forbidden";
  if (s === 404) return "mmap.err.notFound";
  if (s === 429) return "mmap.err.busy";
  return "mmap.err.generic";
}

// The navigation destination cannot be offered (no public office, no live location without a paid order) — the button is disabled.
export const isNavUnavailable = (e: unknown): boolean =>
  ["navigation_destination_unavailable", "public_office_navigation_unavailable", "paid_order_live_location_unavailable", "active_paid_order_required"].includes(codeOf(e));

export const isConsentRequired = (e: unknown): boolean => codeOf(e) === "client_location_consent_required";
export const isGeocoderDown = (e: unknown): boolean => ["geocoder_rate_limit_exceeded", "yandex_geocoder_not_configured", "yandex_geocoder_key_invalid", "yandex_geocoder_unavailable"].includes(codeOf(e)) || (e instanceof ApiError && (e.status === 502 || e.status === 503 || e.status === 429));
