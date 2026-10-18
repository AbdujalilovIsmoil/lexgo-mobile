import { asArr, asDict, asStr } from "@/shared/lib/json";
import type { AssistCaps, AssistClient, AssistContext, AssistSub } from "../model/assistTypes";
import { aiHistoryOf } from "./aiHistory";
import { flag } from "./dict";
import { normDoc, normOrder, normPending } from "./assistRecords";

function normClient(v: unknown): AssistClient | null {
  const d = asDict(v);
  const id = asStr(d.id);
  if (!id) return null;
  const parts = [d.first_name, d.last_name].map((x) => asStr(x).trim()).filter(Boolean);
  return { id, lexgoId: asStr(d.lexgo_id).trim(), role: asStr(d.role).trim(), name: asStr(d.name).trim() || parts.join(" "), phone: asStr(d.phone).trim(), accountStatus: asStr(d.account_status).trim() };
}

function normCaps(v: unknown): AssistCaps {
  const d = asDict(v);
  const on = (x: unknown) => flag(x) === true;
  return {
    subscriptionCheckout: on(d.subscription_checkout), documentLawyerRequest: on(d.document_lawyer_request),
    marketplacePurchaseRequest: on(d.marketplace_purchase_request), urgentAdvokatRequest: flag(d.urgent_advokat_request),
    supportCall: on(d.support_call), operatorTransfer: on(d.operator_transfer),
  };
}

const normSub = (v: unknown): AssistSub => {
  const d = asDict(v);
  return { id: asStr(d.id), planId: asStr(d.plan_id), status: asStr(d.status), billingPeriod: asStr(d.billing_period), endsAt: asStr(d.ends_at) };
};

// GET …/assist/context — client card, capabilities, subscriptions, requests, documents, orders and the AI history.
export function normContext(v: unknown): AssistContext {
  const d = asDict(v);
  return {
    client: normClient(d.client),
    caps: normCaps(d.assist_capabilities),
    subs: asArr(d.active_subscriptions).map(normSub).filter((x) => x.id || x.planId),
    pending: asArr(d.pending_subscription_requests).map(normPending).filter((x) => x.id),
    docs: asArr(d.recent_documents).map(normDoc).filter((x) => x.id),
    orders: asArr(d.recent_orders).map(normOrder).filter((x) => x.id),
    ai: aiHistoryOf(d),
  };
}
