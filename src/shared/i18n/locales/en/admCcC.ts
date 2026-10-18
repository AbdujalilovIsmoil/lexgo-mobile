import type { Messages } from "../uz";

export const admCcC: Messages["admCcC"] = {
  cardNoAccess: "Your role can't open the full client card (orders, payments, history).",
  sumOrders: "Orders", sumSpent: "Total paid", sumLeads: "Leads",
  sumChats: "Chats", sumComplaints: "Complaints", sumSubs: "Active subscription",
  tab: { orders: "Orders", payments: "Payments", leads: "Leads", activity: "Recent activity" },
  none: { orders: "No orders.", payments: "No payments.", leads: "No leads.", activity: "No activity." },
  act: {
    login: "Signed in", logout: "Signed out", ai_classify: "Asked for AI analysis", document_analysis: "Document analysis",
    order_create: "Placed an order", payment_confirmed: "Payment confirmed", gift: "Bought a gift", sos: "Pressed SOS",
    complaint: "Filed a complaint", review: "Left a review", call_center_call: "Duty desk call", secure_chat_create: "Opened a chat",
  },
  clStatus: { active: "Active", inactive: "Inactive", lead: "Lead" },
  payKind: {
    subscription_plan_telegram_approval: "Subscription", subscription_renewal: "Subscription renewal", call_extension: "Call extension",
    document_review_extra_pages: "Document review: extra pages", marketplace_order: "Service order", order: "Service order",
    document_request: "Document template", gift: "Gift subscription", private_chat: "Private chat", subscription_plan: "Subscription",
  },
  src: {
    web: "Website", website: "Website", referral: "Referral", ad: "Ad", ads: "Ads", organic: "Organic", manual: "Manual", phone: "Phone",
    ai_classify: "AI analysis", telegram: "Telegram", call_center: "Duty desk", callcenter: "Duty desk",
  },
  hours: { open: "Open now", closed: "Closed now", dayOff: "Closed today" },
  logCall: "Log call", callSave: "Save", callLogged: "Call logged.",
  noCalls: "No calls.",
  dir2: { incoming: "Incoming", outgoing: "Outgoing" },
  dir3: { incoming: "Incoming", outgoing: "Outgoing", missed: "Missed" },
  callSt: { completed: "Completed", missed: "Missed", no_answer: "No answer", busy: "Busy", failed: "Failed", answered: "Answered" },
  res: { answered: "Talked", no_answer: "No answer", busy: "Busy", callback: "Asked to call back", wrong_number: "Wrong number", note: "Note (no call)" },
  direction: "Direction", phoneRequired: "Enter a phone number.",
  topicPh: "e.g. alimony consultation", duration: "Duration (min)",
  nextPh: "e.g. call back tomorrow at 10:00", next: "Next step", min: "{n} min",
  sec: "{n} sec",
};
