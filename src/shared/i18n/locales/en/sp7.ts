import type { Messages } from "../uz";

export const sp7: Messages["sp7"] = {
  open: {
    subscription_preview: "View plans",
    subscription_checkout: "Open payment",
    document_request: "Open document",
    marketplace_purchase: "Open order",
    urgent_advokat: "Open request",
  },
  openChat: "Open chat",
  later: "Later",
  decline: "Decline",
  declineTitle: "Decline the order?",
  declineText: "The order will be cancelled and nothing will be charged. This cannot be undone.",
  declineDo: "Yes, decline",
  keep: "Keep it",
  declined: "Order cancelled",
  declineFailed: "Could not cancel the order",
  linkTelegram: "Link Telegram",
  openTelegram: "Open Telegram",
  linkFailed: "Could not get the Telegram link",
  tgOff: "Telegram is not linked, so no approval request was sent. Link Telegram — the operator will send it again.",
  tgSent: "The approval request was sent to Telegram. Approve or cancel with the button in the bot — the status changes here.",
  tgGeneric: "Approval happens in Telegram; the status updates here automatically.",
};
