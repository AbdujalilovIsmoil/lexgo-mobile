import { asArr, asDict, asStr, uzs, type Dict } from "@/shared/lib/json";
import type { AddPay } from "../model/assistTypes";
import { currencyOf, dictOf, firstText } from "../api/dict";
import { serverMs } from "./time";

const HOUR = 3_600_000;
export const ADD_PAY_TTL = 24 * HOUR; // TZ 11: the request lives 24 h, operators are warned at 21 h
export const ADD_PAY_WARN = 21 * HOUR;
const KIND = "marketplace_additional_payment";

// The supplemental-payment request of an order (details.additional_payment_request_id + the request / payment objects the
// backend attaches); null when the order never had one. Field names are read leniently - the staging data showed only the id.
export function addPayOf(order: Dict): AddPay | null {
  const det = asDict(order.details);
  const req = dictOf(det.marketplace_additional_payment ?? order.additional_payment_request ?? order.additional_payment);
  const pay = asDict(order.payment);
  const pp = asDict(pay.provider_payload);
  const mine = asStr(pay.target_type) === KIND ? pay : {};
  const requestId = firstText(req.id, req.request_id, det.additional_payment_request_id, order.additional_payment_request_id);
  if (!requestId) return null;
  const status = firstText(req.status, mine.status, order.status).toLowerCase();
  const ids = asArr(req.selected_option_ids ?? asDict(req.payload).selected_option_ids ?? pp.selected_option_ids).map((x) => asStr(x)).filter(Boolean);
  return {
    requestId, status, selectedIds: ids, amount: uzs(req, "amount", "additional_amount") || uzs(mine, "amount"),
    currency: currencyOf(req.currency, mine.currency, order.currency), expiresAt: firstText(req.expires_at, req.deadline_at, mine.expires_at, det.additional_payment_expires_at),
    createdAt: firstText(req.created_at, mine.created_at), pending: status === "waiting_payment" || status === "pending" || asStr(order.status) === "waiting_payment",
  };
}

export type Expiry = { state: "none" | "ok" | "warn" | "expired"; msLeft: number };

// 24 h from the backend's expires_at (else from the request's creation); the warning starts at 21 h. Clock-only, no money.
export function expiryOf(a: Pick<AddPay, "expiresAt" | "createdAt">, now = Date.now()): Expiry {
  const end = serverMs(a.expiresAt) || (serverMs(a.createdAt) ? serverMs(a.createdAt) + ADD_PAY_TTL : 0);
  if (!end) return { state: "none", msLeft: 0 };
  const msLeft = end - now;
  return { state: msLeft <= 0 ? "expired" : msLeft <= ADD_PAY_TTL - ADD_PAY_WARN ? "warn" : "ok", msLeft: Math.max(0, msLeft) };
}
