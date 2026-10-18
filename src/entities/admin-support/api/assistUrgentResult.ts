import { asDict, uzs } from "@/shared/lib/json";
import type { UrgentResult } from "../model/resultTypes";
import { currencyOf, dictOf, filled, firstText, flag } from "./dict";
import { normPayGate, payRequired } from "./payGate";

export function normUrgentResult(v: unknown): UrgentResult {
  const d = asDict(v);
  const nested = dictOf(d.urgent_request ?? d.urgent_advokat_request ?? d.request ?? d.record);
  const r = filled(nested) ? nested : d;
  const p = dictOf(r.payload);
  const lawyer = dictOf(d.assigned_lawyer ?? r.assigned_lawyer);
  const gate = normPayGate(d, r, p);
  return {
    id: firstText(r.id, d.record_id, d.request_id, d.urgent_request_id, d.id),
    workId: firstText(d.work_id, r.work_id, p.work_id),
    status: firstText(r.status, d.status),
    serviceKind: firstText(r.service_kind, p.service_kind, d.service_kind, r.record_type),
    channel: firstText(p.channel, r.channel, d.channel),
    amount: uzs(r, "price") || uzs(p, "price") || uzs(d, "amount", "price"),
    currency: currencyOf(r.currency, p.currency, d.currency),
    immediateCall: flag(d.immediate_call) === true || flag(p.immediate_call) === true,
    telegramSent: d.telegram_sent === true || gate?.telegramSent === true,
    lawyerName: firstText(lawyer.name, p.assigned_lawyer_name),
    clientNotified: flag(d.client_notified ?? d.notified_client ?? d.client_notification_sent),
    paymentRequired: payRequired(d, r, p),
    gate,
  };
}
