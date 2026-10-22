import { ApiError } from "@/shared/api";
import { asDict, asNum, asStr, uzs } from "@/shared/lib/json";
import type { DutyCtor, DutyGate, DutyResult, ExistingRef } from "../model/types";

function gateOf(v: unknown): DutyGate | null {
  const d = asDict(v);
  if (!d.amount && !d.page_count) return null;
  return { amount: uzs(d, "amount"), currency: asStr(d.currency, "UZS"), pageCount: asNum(d.page_count), includedPages: asNum(d.included_pages), extraPages: asNum(d.extra_pages), telegramSent: d.telegram_sent === true };
}

function ctorOf(v: unknown): DutyCtor | null {
  const d = asDict(v);
  return Object.keys(d).length ? { available: d.available === true, promptRequired: d.prompt_required === true, title: asStr(d.title), message: asStr(d.message) } : null;
}

// Every advocate-request POST answers in one of these shapes: { request } | { document_request } | the request itself.
export function normResult(v: unknown): DutyResult {
  const d = asDict(v);
  const req = asDict(d.request ?? d.document_request ?? d);
  return {
    docId: asStr(req.id),
    workId: asStr(req.work_id),
    status: asStr(req.status),
    created: d.already_exists !== true,
    paymentRequired: d.payment_required === true || req.payment_required === true,
    gate: gateOf(d.payment_gate ?? req.payment_gate),
    message: asStr(d.message ?? d.detail),
    ctor: ctorOf(d.constructor_action ?? req.constructor_action),
  };
}

// 409 document_lawyer_request_already_open → the request that is already with the advocates.
export function existingOf(e: unknown): ExistingRef | null {
  if (!(e instanceof ApiError) || e.status !== 409) return null;
  const req = asDict(asDict(e.data.detail).request);
  const id = asStr(req.id);
  return id ? { id, workId: asStr(req.work_id), status: asStr(req.status), message: e.detail ?? "" } : null;
}
