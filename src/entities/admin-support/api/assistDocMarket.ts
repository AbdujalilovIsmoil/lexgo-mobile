import { asDict, asStr, uzs } from "@/shared/lib/json";
import type { DocResult, MarketResult } from "../model/resultTypes";
import { cleanTitle, currencyOf } from "./dict";
import { normPayGate, payRequired } from "./payGate";

export function normDocResult(v: unknown): DocResult {
  const d = asDict(v);
  const r = asDict(d.request);
  const lr = asDict(d.lawyer_request);
  const lrp = asDict(lr.payload);
  const gate = normPayGate(d, r, lr, lrp);
  return {
    requestId: asStr(r.id ?? lr.document_request_id), recordId: asStr(lr.id), workId: asStr(r.work_id), status: asStr(r.status ?? lr.status),
    poolStatus: asStr(lr.pool_status ?? lr.status), title: cleanTitle(r.title ?? lr.title), price: uzs(r, "price"), currency: currencyOf(r.currency),
    paid: r.paid === true, paymentRequired: payRequired(d, r, lr, lrp), telegramSent: d.telegram_sent === true || gate?.telegramSent === true,
    gate, assignmentMode: asStr(d.assignment_mode),
  };
}

export function normMarketResult(v: unknown): MarketResult {
  const d = asDict(v);
  const o = asDict(d.order);
  const det = asDict(o.details);
  const pay = asDict(d.payment);
  const pr = asDict(d.purchase_request);
  const prp = asDict(pr.payload);
  const gate = normPayGate(d, o, pr, pay);
  return {
    workId: asStr(d.work_id) || asStr(prp.work_id) || asStr(det.work_id) || asStr(pr.work_id),
    orderId: asStr(o.id ?? prp.order_id), paymentId: asStr(pay.id ?? prp.payment_id), requestId: asStr(pr.id),
    status: asStr(d.status, "pending") || "pending", orderStatus: asStr(o.status), paymentStatus: asStr(o.payment_status ?? pay.status), nextStatus: asStr(d.next_status),
    amount: uzs(pay, "amount") || uzs(o, "price") || uzs(prp, "amount"), currency: currencyOf(pay.currency, o.currency, prp.currency),
    telegramSent: d.telegram_sent === true || pay.telegram_sent === true || gate?.telegramSent === true, sellerAfterPayment: d.seller_will_receive_after_payment !== false,
    serviceTitle: cleanTitle(o.service_title ?? prp.service_title ?? det.service_title), lawyerName: asStr(prp.lawyer_name ?? o.lawyer_name ?? det.lawyer_name).trim(), gate,
  };
}
