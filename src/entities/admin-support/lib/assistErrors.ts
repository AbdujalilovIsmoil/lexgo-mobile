import { ApiError } from "@/shared/api";
import { asDict, asStr } from "@/shared/lib/json";
import type { AssistBlock } from "../model/assistTypes";
import { firstText } from "../api/dict";

const detailOf = (e: ApiError) => asDict(e.data.detail);
const codeOf = (e: ApiError) => firstText(e.code, detailOf(e).code, e.data.code);
const absent = (e: ApiError) => e.status === 501 || (e.status === 404 && (!e.detail || e.detail === "Not Found")) || e.status === 405;

// Why the assist panel is locked (the backend phrases these in Uzbek, as the web matches them).
export function assistBlockOf(e: unknown): AssistBlock | null {
  if (!(e instanceof ApiError)) return null;
  const d = (e.detail || "").toLowerCase();
  if (e.status === 409 && (codeOf(e) === "ticket_closed" || /yopilgan ticket/.test(d))) return "closed";
  if (e.status === 404 && /accountiga ulanmagan/.test(d)) return "notClient";
  if (e.status === 404 && /support ticket topilmadi/.test(d)) return "missing";
  if (e.status === 403 && /biriktirilgan operator|operator ruxsati/.test(d)) return "notAssigned";
  return absent(e) ? "unavailable" : null;
}

export type AssistErrorKind = "planMissing" | "planRole" | "period" | "needRequired" | "notApproved";

export function assistErrorKind(e: unknown): AssistErrorKind | null {
  if (!(e instanceof ApiError)) return null;
  const d = (e.detail || "").toLowerCase();
  if (e.status === 422 && Array.isArray(detailOf(e).allowed_billing_periods)) return "period";
  if (e.status === 404 && /paket topilmadi/.test(d)) return "planMissing";
  if (e.status === 403 && /paket/.test(d) && /ochilmagan/.test(d)) return "planRole";
  if (e.status === 422 && /ehtiyoji kerak/.test(d)) return "needRequired";
  if (e.status === 409 && /tasdiqlanmagan/.test(d)) return "notApproved";
  return null;
}

export type Duplicate = { kind: "doc" | "market" | "urgent"; workId: string };

// 409s that mean "the client already has an open request of this kind".
export function duplicateOf(e: unknown): Duplicate | null {
  if (!(e instanceof ApiError) || e.status !== 409) return null;
  const dd = detailOf(e);
  const code = codeOf(e);
  if (code === "document_lawyer_request_already_open") return { kind: "doc", workId: asStr(asDict(dd.request).work_id) };
  if (code === "marketplace_order_already_active") return { kind: "market", workId: asStr(dd.work_id) };
  const req = asDict(dd.request ?? dd.urgent_request ?? dd.record);
  const workId = firstText(dd.work_id, req.work_id, asDict(req.payload).work_id);
  if (code === "ticket_closed" || (!workId && !/already|duplicate|active|open/i.test(code))) return null;
  return { kind: "urgent", workId };
}

// Urgent request: the 402 that explains the "advocate panel needs a previous purchase" rule.
export function isPriorPurchase(e: unknown): boolean {
  if (!(e instanceof ApiError) || e.status !== 402) return false;
  return /previous_lexgo_(purchase|advokat_service)_required/i.test([codeOf(e), e.detail || ""].join(" "));
}

export const isRouteMissing = (e: unknown) => e instanceof ApiError && absent(e);

const FIELD: Record<string, string> = { service_kind: "kind", kind: "kind", channel: "channel", lawyer_count: "count", directions: "directions", specializations: "directions", need: "need", description: "need" };

// 422 field errors of the urgent form, keyed by form field.
export function urgentFieldErrors(e: unknown): Record<string, string> {
  if (!(e instanceof ApiError) || e.status !== 422) return {};
  const out: Record<string, string> = {};
  for (const [k, msg] of Object.entries(e.fieldErrors)) if (FIELD[k] && msg && !out[FIELD[k]]) out[FIELD[k]] = msg;
  return out;
}
