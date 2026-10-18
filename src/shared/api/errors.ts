import { asDict, asStr, type Dict } from "@/shared/lib/json";

// Same contract as lib/http.ts ApiError on the web.
export class ApiError extends Error {
  status: number;
  detail?: string;
  code?: string;
  retryAfter?: number;
  data: Dict;
  fieldErrors: Record<string, string>;

  constructor(status: number, detail?: string, extra?: { code?: string; retryAfter?: number; data?: Dict; fieldErrors?: Record<string, string> }) {
    super(detail || `HTTP ${status}`);
    this.name = "ApiError";
    this.status = status;
    this.detail = detail;
    this.code = extra?.code;
    this.retryAfter = extra?.retryAfter;
    this.data = extra?.data ?? {};
    this.fieldErrors = extra?.fieldErrors ?? {};
  }
}

const is = (e: unknown, s: number) => e instanceof ApiError && e.status === s;
export const isUnauthorized = (e: unknown) => is(e, 401);
export const isPaymentRequired = (e: unknown) => is(e, 402);
export const isForbidden = (e: unknown) => is(e, 403);
export const isValidation = (e: unknown) => is(e, 422);
export const isRateLimited = (e: unknown) => is(e, 429);
export const isNetworkError = (e: unknown) => is(e, 0);

export function isLimitError(e: unknown): boolean {
  if (!(e instanceof ApiError)) return false;
  if (e.detail && /limit|лимит/i.test(e.detail)) return true;
  return e.status === 401 || e.status === 402 || e.status === 429;
}

// FastAPI: detail may be a string, {message, code}, or a 422 list of {loc, msg}.
export function parseErrorBody(status: number, body: unknown, retryAfterHeader?: string | null): ApiError {
  const d = asDict(body);
  const detail = d.detail;
  const fieldErrors: Record<string, string> = {};
  let message = "";
  let code: string | undefined;
  if (typeof detail === "string") message = detail;
  else if (Array.isArray(detail)) {
    for (const item of detail) {
      const it = asDict(item);
      const loc = Array.isArray(it.loc) ? asStr(it.loc[it.loc.length - 1]) : "";
      if (loc) fieldErrors[loc] = asStr(it.msg);
    }
    message = Object.values(fieldErrors)[0] ?? "";
  } else {
    const dd = asDict(detail);
    message = asStr(dd.message ?? dd.detail ?? d.message ?? d.error);
    code = asStr(dd.code ?? d.code) || undefined;
  }
  const retry = Number(retryAfterHeader ?? d.retry_after);
  return new ApiError(status, message || undefined, {
    code,
    data: d,
    fieldErrors,
    retryAfter: Number.isFinite(retry) && retry > 0 ? retry : undefined,
  });
}
