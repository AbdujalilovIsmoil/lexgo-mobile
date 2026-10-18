import { humanizeSlug } from "@/shared/lib/format";
import { asDict, asNum, asStr, uzs, type Dict } from "@/shared/lib/json";
import type { AssistInfo, AssistKind } from "../model/assistTypes";
import type { SupportEvent } from "./events";
import { gateOf, payPhase } from "./assistPay";

const KIND: Record<string, AssistKind> = {
  "support.assist_subscription_preview_created": "subscription_preview",
  "support.assist_subscription_checkout_created": "subscription_checkout",
  "support.assist_document_request_created": "document_request",
  "support.assist_marketplace_purchase_requested": "marketplace_purchase",
  "support.assist_urgent_advokat_request_created": "urgent_advokat",
};

const first = (...v: unknown[]) => v.map((x) => asStr(x).trim()).find(Boolean) ?? "";

// The operator's action payload (the result of the assist endpoint) → what the client sees.
// Shapes follow the web's assistInfoOf and were checked against the live preview event.
export function assistInfoOf(e: SupportEvent, locale: string): AssistInfo | null {
  const kind = KIND[e.name];
  const a: Dict = e.action ?? {};
  if (!kind || !Object.keys(a).length) return null;
  const plan = asDict(a.plan), req = asDict(a.request), lawyer = asDict(a.lawyer_request), order = asDict(a.order);
  const purchase = asDict(a.purchase_request), pay = asDict(a.payment), quote = asDict(a.price_quote);
  const urgent = kind === "urgent_advokat" ? asDict(a.urgent_request ?? a.urgent_advokat_request ?? a.record ?? (req.id ? req : a)) : {};
  const gate = gateOf(a, req, lawyer, urgent);
  const workId = first(a.work_id, urgent.work_id, asDict(urgent.payload).work_id, req.work_id, lawyer.work_id, order.work_id, purchase.work_id);
  const status = first(a.status, urgent.status, req.status, order.status);
  const required = [a.payment_required, req.payment_required, urgent.payment_required].includes(true);
  const doc = kind === "document_request";
  const statuses = kind === "subscription_checkout" ? [a.status, pay.status, gate.status] : doc ? [req.status, lawyer.status, lawyer.pool_status, gate.status] : [order.payment_status, order.status, urgent.status, pay.status, gate.status];
  return {
    key: kind === "subscription_preview" ? `${kind}:${e.ticketId}` : `${kind}:${workId || first(order.id, req.id, urgent.id, a.id) || e.createdAt}`,
    kind, ticketId: e.ticketId, ticketWorkId: e.ticket?.workId ?? "", at: e.createdAt || new Date().toISOString(),
    workId,
    title: first(asDict(plan.name)[locale], plan.title, urgent.title, req.title, order.service_title, purchase.title) || (kind === "urgent_advokat" ? humanizeSlug(first(urgent.service_kind, asDict(urgent.payload).service_kind)) : ""),
    amount: Math.max(0, uzs(a, "amount") || uzs(gate, "amount") || uzs(urgent, "price") || uzs(req, "price") || uzs(order, "price") || uzs(pay, "amount") || uzs(quote, "total_amount")),
    currency: first(a.currency, gate.currency, urgent.currency, order.currency, req.currency, pay.currency) || "UZS",
    status,
    telegramSent: typeof a.telegram_sent === "boolean" ? a.telegram_sent : typeof gate.telegram_sent === "boolean" ? gate.telegram_sent : null,
    pay: kind === "subscription_preview" ? "" : payPhase(statuses, required, gate.status),
    targetId: first(kind === "urgent_advokat" ? urgent.id ?? a.record_id : doc ? req.id ?? lawyer.document_request_id : order.id ?? a.order_id),
    paymentId: first(a.payment_id, pay.id),
    billingPeriod: first(a.billing_period), months: asNum(a.months), discountPercent: asNum(quote.discount_percent), baseAmount: uzs(quote, "base_amount"),
  };
}
