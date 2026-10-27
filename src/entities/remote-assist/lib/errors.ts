import { ApiError } from "@/shared/api";
import { asArr, asDict, asNum, asStr } from "@/shared/lib/json";

// `detail.code` is the stable discriminator (TZ RA §19).
export const RA_ERR = {
  consentNotPending: "remote_assist_consent_not_pending",
  revisionStale: "remote_assist_ui_revision_stale",
  revisionConflict: "remote_assist_ui_revision_conflict",
  deviceMismatch: "remote_assist_device_session_mismatch",
  secretBlocked: "remote_assist_secret_component_blocked",
  personalScope: "remote_assist_personal_scope_required",
  sensitivePayload: "remote_assist_sensitive_payload_blocked",
  sensitiveRoute: "remote_assist_sensitive_route_blocked",
  sessionExpired: "remote_assist_session_expired",
  commandExpired: "remote_assist_command_expired",
  rateLimit: "remote_assist_rate_limit",
} as const;

/** The error code of a failed call (an ApiError) or of a socket `error` frame (its body). */
export function raErrorCode(e: unknown): string {
  if (e instanceof ApiError) return e.code || asStr(asDict(e.data.detail).code ?? e.data.code);
  const d = asDict(e);
  return asStr(asDict(d.detail).code ?? d.code);
}

/** The component ids an error names (`remote_assist_secret_component_blocked`): `component_id` or `component_ids`, in the detail or the body. */
export function raErrorComponents(e: unknown): string[] {
  const body = e instanceof ApiError ? e.data : asDict(e);
  const ids = [asDict(body.detail), body].flatMap((d) => [asStr(d.component_id), ...asArr(d.component_ids).map((x) => asStr(x))]);
  return [...new Set(ids.filter(Boolean))];
}

/** Seconds to wait after `remote_assist_rate_limit` (`retry_after_seconds`, else the Retry-After header); 0 when none was given. */
export function raRetryAfter(e: unknown): number {
  const body = e instanceof ApiError ? e.data : asDict(e);
  const s = asNum(asDict(body.detail).retry_after_seconds ?? body.retry_after_seconds, NaN);
  if (Number.isFinite(s) && s > 0) return s;
  return e instanceof ApiError && e.retryAfter ? e.retryAfter : 0;
}
