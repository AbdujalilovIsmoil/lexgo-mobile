import type { Messages } from "../uz";

export const admSup: Messages["admSup"] = {
  tabs: { new: "New", mine: "Assigned to me", transferred: "Transferred", closed: "Closed" },
  st: {
    ai_handling: "AI is replying", waiting_operator: "Waiting for operator", claimed: "Operator joined", transferred: "Transferred",
    waiting_client_confirm: "Awaiting confirmation", reopened: "Reopened", closed: "Closed", resolved: "Resolved", cancelled: "Cancelled",
  },
  cat: {
    general: "General", subscription: "Plan / subscription", payment: "Payment", marketplace: "Finding a lawyer", documents: "Documents", document: "Document",
    urgent_advokat: "Urgent advocate", account: "Account", technical: "Technical issue",
  },
  prio: { low: "Low", normal: "Normal", high: "High", urgent: "Urgent" },
  roles: {
    client: "Client", operator: "Operator", admin: "Admin", yurist: "Lawyer", advokat: "Advocate", org: "Law firm", sales: "Sales", manager: "Manager",
    system: "System", ai: "AI instructor",
  },
  lead: "Client and specialist chats with operators: claim, reply, transfer or close.", empty: "No chats in this tab.",
  emptyText: "The list refreshes automatically.", oldestFirst: "Longest waiting first", claim: "Claim", claimedOk: "The chat is assigned to you",
  claimTaken: "Another operator already took this chat", transfer: "Transfer to another operator", transferDo: "Transfer",
  transferOk: "The chat was transferred to another operator", transferOff: "This ticket can't be passed to another operator.", operator: "Operator",
  operatorSearch: "Operator name or phone", operatorNone: "No operator found", client: "Client", reasonPh: "For example: to the payments specialist",
  reasonRequired: "Please give a reason", close: "Close the chat", closeDo: "Close",
  closeNote: "After closing, the client can write here again only by reopening the chat.", closedOk: "Chat closed", resolution: "Resolution",
  resolutionPh: "For example: helped the client pick a plan", resolutionRequired: "Please write the resolution", reopen: "Reopen", reopenDo: "Reopen the chat",
  reopenReason: "What is still unresolved? (optional)", reopenPh: "For example: the payment still fails",
  reopenedOk: "The chat is open again — you can write to the operator", reopenReasonLbl: "Reopen reason", transferReasonLbl: "Transfer reason",
  priority: "Priority", topic: "Topic", urgent: "Urgent", untitled: "Operator chat", details: "Ticket", closedLbl: "Closed at",
  wait: { now: "Just arrived", min: "Waiting {n} min", hour: "Waiting {h} h {m} min", day: "Waiting {n} d" }, viewChat: "Chat", ph: "Type your message…",
  noMessages: "No messages yet.", loadOlder: "Earlier messages", readOnly: "This chat isn't assigned to you — view only.", today: "Today",
  yesterday: "Yesterday", closedBanner: "Chat closed", closedAt: "Closed: {date}", noResolution: "The operator didn't leave a summary.",
  contactBlocked: "You can't share contact details outside the platform. Please keep the conversation here.",
  sendFailed: "Not sent · retry", callAudio: "Audio call", callVideo: "Video call", calling: "Connecting…",
  callFailed: "Couldn't start the call. Please try again.", callTitle: "LexGo support call · {id}", callTitlePlain: "LexGo support call",
  hero: {
    oldest: "Longest wait", search: "Search by client, ID or message", noMatch: "Nothing found",
    off: "Operator queue is off", offText: "The server has switched this section off for now.",
    min: "{n} min", hour: "{h} h {m} m", day: "{n} d",
  },
};
