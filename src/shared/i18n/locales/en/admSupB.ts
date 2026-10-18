import type { Messages } from "../uz";

export const admSupB: Messages["admSupB"] = {
  title: "Help the client", viewOnly: "View only: another operator owns this chat and acts for the client.",
  stale: "Could not refresh — showing the last known state.", showAll: "All ({n})", showLess: "Show less",
  ai: {
    title: "AI chat history", lead: "Came from the AI assistant · questions: {n}", client: "Client", ai: "AI answer", session: "AI session: {id}",
    earlier: "Earlier questions: {n}",
  },
  client: { noName: "No name given", account: "Account: {status}", audio: "Audio", video: "Video" },
  overview: {
    heading: "Client status", subs: "Active plans", pending: "Awaiting payment", docs: "Documents", orders: "Orders", subsEmpty: "No active plans.",
    pendingEmpty: "No requests awaiting payment.", docsEmpty: "No document requests.", ordersEmpty: "No orders.", until: "until {date}", via: "Via operator",
    plan: "Plan",
  },
  pay: {
    pending: "Waiting for payment approval", paid: "Payment approved", rejected: "Payment cancelled",
    pendingHint: "Approved in Telegram · status updates by itself", paidHint: "Approval came from Telegram", rejectedHint: "Rejected in Telegram",
    pendingShort: "Awaiting payment", docPending: "Once the payment is approved, the request goes to on-duty lawyers.",
    marketPaid: "Order paid; the client's chat with the specialist is open.", planPaid: "The plan is now active for the client.",
    planReviewed: "The request has been reviewed — see the result under “Client status”.",
    rejectedNote: "If needed, talk to the client and send the request again.",
  },
  result: {
    workId: "Work ID", requestId: "Request ID", notified: "Client notified", tgSent: "Sent for approval", tgFailed: "Not delivered — tell an admin",
    next: "Next step", mode: "Assignment",
  },
  lock: {
    claimTitle: "Claim the chat first",
    claimText: "You can act on the client's behalf only in a chat assigned to you. Once you claim it, you can create plan, document, service and urgent lawyer requests here.",
    otherTitle: "Another operator has this chat", otherText: "Only the operator assigned to this chat can act on the client's behalf.",
    closedTitle: "The chat is closed", closedText: "Nothing can be done on the client's behalf in a closed chat.", notClientTitle: "For client chats only",
    notClientText: "This request did not come from a client account (for example, an advocate or a lawyer wrote it). Acting on someone's behalf works for clients only.",
    missingTitle: "Chat not found", missingText: "This chat was removed or is not visible to you.", unavailableTitle: "Client help is not available yet",
    unavailableText: "The server does not support these actions yet. Try again later.", errorTitle: "Could not load the client's details",
    errorText: "Couldn't load the data. Try again.",
  },
  tabs: {
    label: "Act on the client's behalf", plan: "Plan", doc: "Document", market: "Service", urgent: "Urgent lawyer", off: "Off",
    hint: { plan: "Sell a plan", doc: "Lawyer drafts", market: "Marketplace", urgent: "Connect now" },
  },
  err: {
    priorPurchase: "For a lawyer panel the client must have used a LexGo lawyer service before.",
    urgentDup: "The client already has an active urgent request: {id}.", urgentDupPlain: "The client already has an active urgent request.",
    planMissing: "This plan was not found or is not on sale.", planRole: "This plan is not open to clients.",
    period: "This term is not available for the chosen plan.", needRequired: "Describe what the client needs.",
    notApproved: "The specialist is not approved for the marketplace yet.", docDup: "The client already has an open request for this document: {id}.",
    docDupPlain: "The client already has an open request for this document.",
    marketDup: "The client already has an active request with this specialist for this service: {id}.",
    marketDupPlain: "The client already has an active request with this specialist for this service.",
  },
};
