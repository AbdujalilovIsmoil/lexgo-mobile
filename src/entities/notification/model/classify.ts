import { asStr, type Dict } from "@/shared/lib/json";
import type { NotifCategory } from "./types";

// Event name → category (law-main/lib/notifications.ts). The backend stores "system" for every
// event row, so the category is worked out here: exact names, prefix rules, delivery channel, title.
const EXACT: Record<string, NotifCategory> = {
  payment_paid: "payments", order_payment_updated: "payments", milestone_paid: "payments", milestone_released: "payments",
  document_payment_created: "payments", document_payment_auto_confirmed: "payments", upsell_redeemed: "marketing",
  seller_register_approved: "system", seller_register_rejected: "system", sos_request: "orders",
  secure_chat_message: "chat", meeting_invite: "chat", contract_signature_otp: "documents",
};

const EVENT_RULES: [RegExp, NotifCategory][] = [
  [/^(order|sos|marketplace_|milestone_(created|updated|approved|rejected))/, "orders"],
  [/^(payment|payout|invoice|refund|subscription|milestone|upsell_paid|gift_paid|call_extension_payment)/, "payments"],
  [/^(secure_chat|chat|message|call|meeting|video|voice|support|urgent_advokat)/, "chat"],
  [/^(document|ai_document|existing_document|custom_document|contract|signature|quality_complaint|workspace_file|file_)/, "documents"],
  [/^(upsell|promo|campaign|offer|gift|referral|bonus|discount|marketing|academy)/, "marketing"],
  [/^(register|seller_register|identity|security|account|password|2fa|two_factor|login|session|consent|system|studio|internal)/, "system"],
];

const TITLE_RULES: [RegExp, NotifCategory][] = [
  [/buyurtma|заказ|order|sos|bosqich|milestone/i, "orders"],
  [/to['‘’ʼ]?lov|оплат|платеж|платёж|payment|obuna|подписк|subscription|chek|чек|receipt|invoice/i, "payments"],
  [/xabar|сообщени|message|chat|чат|qo['‘’ʼ]?ng['‘’ʼ]?iroq|звон|\bcall\b|uchrashuv|встреч|meeting|video|видео/i, "chat"],
  [/hujjat|документ|document|shartnoma|договор|contract|imzo|подпис|sign/i, "documents"],
  [/taklif|предложен|offer|aksiya|акци|promo|chegirma|скидк|discount|sovg['‘’ʼ]?a|подар|gift|referal|реферал|bonus|бонус/i, "marketing"],
];

const ALL: NotifCategory[] = ["orders", "payments", "chat", "documents", "system", "marketing"];

export function categoryOf(event: string, channels: string[], title: string, data?: Dict): NotifCategory {
  const ev = event.trim().toLowerCase();
  const explicit = ev ? "" : asStr(data?.category).trim().toLowerCase();
  if (ALL.includes(explicit as NotifCategory)) return explicit as NotifCategory;
  if (ev) {
    if (EXACT[ev]) return EXACT[ev];
    if (ev.startsWith("calendar_event")) return /call|meeting|video|uchrashuv|qo.?ng.?iroq|встреч|звон/i.test(asStr(data?.type)) ? "chat" : "system";
    for (const [re, cat] of EVENT_RULES) if (re.test(ev)) return cat;
  }
  if (channels.some((c) => c === "secure_chat" || c === "meeting_invite")) return "chat";
  for (const [re, cat] of TITLE_RULES) if (re.test(title)) return cat;
  return "system";
}
