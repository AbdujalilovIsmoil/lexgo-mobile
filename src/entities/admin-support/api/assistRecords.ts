import { asDict, asNum, asStr, uzs } from "@/shared/lib/json";
import type { AssistDoc, AssistOrder, AssistPending } from "../model/assistTypes";
import { cleanTitle, currencyOf } from "./dict";
import { normPayGate, payRequired } from "./payGate";
import { addPayOf } from "../lib/addPay";

const WORK_ID = /^[A-Z]{2,7}-[0-9A-Z]{5,8}$/;
const SOURCE = "callcenter_assist";

export function normPending(v: unknown): AssistPending {
  const d = asDict(v);
  const p = asDict(d.payload);
  const own = asStr(p.work_id).trim().toUpperCase();
  return {
    id: asStr(d.id), workId: WORK_ID.test(own) ? own : asStr(d.work_id), status: asStr(d.status), planId: asStr(p.plan_id), planSlug: asStr(p.plan_slug),
    planTitle: asStr(p.plan_title).trim(), billingPeriod: asStr(p.billing_period), months: asNum(p.months), amount: uzs(p, "amount") || uzs(d, "price"),
    currency: currencyOf(p.currency, d.currency), viaOperator: asStr(p.source) === SOURCE, createdAt: asStr(d.created_at),
  };
}

export function normDoc(v: unknown): AssistDoc {
  const d = asDict(v);
  const a = asDict(d.answers);
  return {
    id: asStr(d.id), workId: asStr(d.work_id), title: cleanTitle(d.title), status: asStr(d.status), requestedType: asStr(d.requested_document_type ?? a.requested_document_type).trim(),
    price: uzs(d, "price"), currency: currencyOf(d.currency), paid: d.paid === true, paymentRequired: payRequired(d, a), gate: normPayGate(d, a),
    viaOperator: asStr(a.mode) === "support_assist_lawyer_pool" || Boolean(asStr(a.support_ticket_id)), createdAt: asStr(d.created_at),
  };
}

export function normOrder(v: unknown): AssistOrder {
  const d = asDict(v);
  const det = asDict(d.details);
  const own = asStr(det.work_id).trim().toUpperCase();
  return {
    addPay: addPayOf(d), serviceId: asStr(d.service_id), packageId: asStr(d.package_id), lawyerUserId: asStr(d.lawyer_user_id), id: asStr(d.id), workId: WORK_ID.test(own) ? own : asStr(d.work_id), title: cleanTitle(d.service_title ?? det.service_title), lawyerName: asStr(d.lawyer_name ?? det.lawyer_name).trim(),
    status: asStr(d.status), paymentStatus: asStr(d.payment_status), price: uzs(d, "price"), currency: currencyOf(d.currency), viaOperator: asStr(det.source) === SOURCE, createdAt: asStr(d.created_at),
  };
}
