export type AssistKind = "subscription_preview" | "subscription_checkout" | "document_request" | "marketplace_purchase" | "urgent_advokat";
/** Payment state of what the operator prepared. Only ever set from backend data, never by the client. */
export type AssistPay = "" | "pending" | "approved" | "rejected";

/** What an operator did on the client's behalf, as shown to the client (TZ 33). */
export type AssistInfo = {
  key: string; kind: AssistKind; ticketId: string; ticketWorkId: string; at: string;
  workId: string; title: string; amount: number; currency: string; status: string;
  telegramSent: boolean | null; pay: AssistPay;
  targetId: string; paymentId: string; // order / document request / urgent record, and the payment
  billingPeriod: string; months: number; discountPercent: number; baseAmount: number;
};
