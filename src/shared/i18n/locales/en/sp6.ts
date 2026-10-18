import type { Messages } from "../uz";

export const sp6: Messages["sp6"] = {
  kicker: "Operator help",
  title: {
    subscription_preview: "The operator picked a plan for you",
    subscription_checkout: "The operator prepared your plan payment",
    document_request: "The operator created a document request",
    marketplace_purchase: "The operator created a service order",
    urgent_advokat: "The operator created an urgent advocate request",
  },
  note: {
    subscription_preview: { default: "This is a preview only: nothing is charged yet. If the price and terms suit you, tell the operator and they will set the plan up." },
    subscription_checkout: { default: "A payment request was created. Money is charged only after you approve it in Telegram; the plan then turns on automatically.", approved: "Payment approved — your plan is being activated.", rejected: "The payment was not approved or was cancelled. Nothing was charged." },
    document_request: { default: "Your document request was sent to the duty lawyers. You'll get a notification when a lawyer takes it.", pending: "The document request is ready. Once you approve the payment in Telegram, it joins the advocates' queue.", approved: "Payment approved — your request is in the advocates' queue. You'll get a notification when a lawyer takes it.", rejected: "The document request payment was cancelled. The request was not sent to the advocates." },
    marketplace_purchase: { default: "A service order was created. Approve the payment in Telegram and the specialist will start. If you don't want it, decline the order.", approved: "Payment approved — the specialist is starting.", rejected: "The order was cancelled. Nothing was charged." },
    urgent_advokat: { default: "An urgent advocate request was created. We'll tell you as soon as a duty advocate accepts it.", pending: "The request was created; waiting for payment approval in Telegram. Then it goes to a duty advocate.", approved: "Payment approved — the request went to a duty advocate.", rejected: "The payment was cancelled — the request was not sent." },
  },
  row: {
    subscription_preview: "Plan",
    subscription_checkout: "Plan",
    document_request: "Document",
    marketplace_purchase: "Service",
    urgent_advokat: "Service",
    amount: "Price",
    discount: "Discount",
    period: "Period",
    workId: "ID",
    ticket: "Chat",
    status: "Status",
  },
  pay: { pending: "Awaiting approval", approved: "Approved", rejected: "Cancelled" },
  period: { monthly: "Monthly", six_month: "6 months", yearly: "Yearly", prepaid_yearly: "Yearly (prepaid)" },
  months: "{n} months",
  settled: { approved: "Approved — status updated", rejected: "Cancelled — status updated" },
};
