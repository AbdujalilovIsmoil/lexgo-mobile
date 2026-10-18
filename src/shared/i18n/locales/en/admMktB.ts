import type { Messages } from "../uz";

export const admMktB: Messages["admMktB"] = {
  status: {
    pending_payment: "Awaiting payment",
    paid: "Active",
    completed: "Completed",
    cancelled: "Cancelled",
    rejected: "Rejected",
    expired: "Expired",
    refunded: "Refunded",
  },
  pay: {
    pending: "Payment pending",
    paid: "Paid",
    cancelled: "Payment cancelled",
    refunded: "Refunded",
    failed: "Payment failed",
  },
  types: { advokat: "Advocate", yurist: "Lawyer", advokat_tashkiloti: "Law firm" },
  channels: { chat: "Chat", audio: "Audio call", video: "Video call", meeting: "Meeting" },
  providers: { telegram_manual: "Telegram (manual approval)" },
  actions: {
    marketplace_purchase_request_create: "Purchase request created",
    marketplace_purchase_approved: "Purchase approved",
    marketplace_purchase_rejected: "Purchase rejected",
    marketplace_order_paid: "Payment received",
    marketplace_order_cancelled: "Order cancelled",
    marketplace_order_completed: "Order completed",
  },
  confirmStatus: {
    approved: "Approved",
    rejected: "Rejected",
    pending: "Awaiting reply",
    cancelled: "Cancelled",
    expired: "Expired",
  },
};
