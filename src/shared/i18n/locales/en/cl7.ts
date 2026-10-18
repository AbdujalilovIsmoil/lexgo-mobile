import type { Messages } from "../uz";

export const cl7: Messages["cl7"] = {
  unknown: "Section not found",
  unknownText: "This list does not exist.",
  kinds: {
    works: { title: "Active works", sub: "Works that are not finished yet" },
    documents: { title: "My documents", sub: "Document archive" },
    orders: { title: "Orders", sub: "Your marketplace orders" },
    payments: { title: "Payments", sub: "Your payment requests" },
    chats: { title: "Messages", sub: "Secure chats" },
  },
  filters: {
    all: "All",
    ready: "Ready",
    active: "Active",
    pending: "Pending",
    unread: "Unread",
  },
  empty: {
    documents: "No documents",
    documentsText: "Documents you prepare will appear here.",
    orders: "No orders",
    ordersText: "Services you order in the marketplace will appear here.",
    payments: "No payments",
    paymentsText: "Payment requests will appear here.",
    chats: "No messages",
    chatsText: "This list is empty when there are no new messages.",
  },
  payKind: {
    order: "Order payment",
    subscription_plan_telegram_approval: "Subscription payment",
    subscription_plan: "Subscription payment",
    document_request: "Document payment",
    urgent_advokat: "Urgent service payment",
    document_analysis: "Document analysis payment",
  },
};
