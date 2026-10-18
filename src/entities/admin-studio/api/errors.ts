import { ApiError } from "@/shared/api";
import { asArr, asDict } from "@/shared/lib/json";
import { first } from "../lib/norm";

export type StudioErrorKind = "payload_invalid" | "submit_invalid" | "publish_requires_approved" | "publish_failed" | "forbidden" | "missing" | "not_found" | "conflict" | "validation" | "network" | "other";
export type StudioError = { status: number; code: string; kind: StudioErrorKind; message: string; fieldErrors: Record<string, string> };

function fieldErrorsOf(d: Record<string, unknown>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const it of asArr(d.errors ?? d.field_errors)) {
    const e = asDict(it);
    const loc = Array.isArray(e.loc) ? e.loc.filter((s) => s && s !== "body" && s !== "payload").join(".") : "";
    const msg = first(e.message, e.msg, e.error);
    if (msg) out[first(e.field, e.path, loc) || "_"] = msg;
  }
  return out;
}

const KINDS: Record<string, StudioErrorKind> = { studio_payload_invalid: "payload_invalid", studio_submit_invalid: "submit_invalid", studio_publish_requires_approved: "publish_requires_approved", studio_publish_failed: "publish_failed" };

// Same classification as studioErrorOf in law-main/lib/services/studio.ts.
export function studioError(e: unknown): StudioError {
  if (!(e instanceof ApiError)) return { status: 0, code: "", kind: "other", message: "", fieldErrors: {} };
  const dd = asDict(e.data.detail);
  const code = first(e.code, dd.code);
  const fieldErrors = { ...e.fieldErrors, ...fieldErrorsOf(dd), ...fieldErrorsOf(e.data) };
  let kind: StudioErrorKind = KINDS[code] ?? "other";
  if (kind === "other") {
    if (e.status === 0) kind = "network";
    else if (e.status === 403) kind = "forbidden";
    else if (e.status === 404) kind = "not_found";
    else if (e.status === 409) kind = "conflict";
    else if (e.status === 422) kind = "validation";
  }
  return { status: e.status, code, kind, message: first(dd.message, e.detail), fieldErrors };
}

export const isRouteMissing = (e: unknown): boolean => e instanceof ApiError && (e.status === 404 || e.status === 405 || e.status === 501);
