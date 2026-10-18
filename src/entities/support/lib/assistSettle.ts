import { asDict, asStr, type Dict } from "@/shared/lib/json";
import type { AssistKind, AssistPay } from "../model/assistTypes";

export type Settle = { kind: AssistKind; pay: AssistPay; ids: string[] };

// Backend events that finish (or fail) what an operator prepared. The client never decides this itself.
const RULES: [RegExp, AssistKind, AssistPay][] = [
  [/^(subscription\.(activated|purchase_approved)|payment\.succeeded)$/, "subscription_checkout", "approved"],
  [/^(subscription\.purchase_rejected|payment\.failed)$/, "subscription_checkout", "rejected"],
  [/^marketplace\.(order_paid|purchase_approved)$/, "marketplace_purchase", "approved"],
  [/^marketplace\.(purchase_rejected|order_cancelled)$/, "marketplace_purchase", "rejected"],
  [/^document_request\.(payment_approved|pool_created|sent)$/, "document_request", "approved"],
  [/^document_request\.(payment_rejected|payment_cancelled)$/, "document_request", "rejected"],
];

const ID_KEYS = ["payment_id", "order_id", "document_request_id", "request_id", "record_id", "purchase_request_id"];

/** A settling event (also when wrapped in notification.created) → what it settles, or null. */
export function settleOf(e: Dict): Settle | null {
  let name = asStr(e.event);
  let src: Dict = e;
  if (name === "notification.created") {
    src = asDict(asDict(e.notification).data);
    name = asStr(src.event);
  }
  const rule = RULES.find(([re]) => re.test(name));
  if (!rule) return null;
  const ids = ID_KEYS.map((k) => asStr(src[k]).trim()).filter(Boolean);
  const pay = asDict(src.payment).id;
  return { kind: rule[1], pay: rule[2], ids: pay ? [...ids, asStr(pay)] : ids };
}
