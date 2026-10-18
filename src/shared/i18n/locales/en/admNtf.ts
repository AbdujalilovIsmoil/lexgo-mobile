import type { Messages } from "../uz";

export const admNtf: Messages["admNtf"] = {
  lead: "Send users a notification: in-app, by push, Telegram or email.",
  channel: "Channel",
  body: "Message",
  category: "Category",
  categoryNote: "The recipient sees the notification under its category.",
  fillFields: "Fill in the title and the message.",
  send: "Send",
  sending: "Sending…",
  stop: "Stop",
  progress: "Sending… {done}/{total}",
  channels: { push: "Push", telegram: "Telegram", email: "Email", sms: "SMS" },
  cats: {
    orders: "Orders",
    payments: "Payments",
    chat: "Chat & calls",
    documents: "Documents",
    system: "System",
    marketing: "Marketing",
  },
  roles: {
    all: "All",
    client: "Clients",
    yurist: "Lawyers",
    advokat: "Advocates",
    advokat_tashkiloti: "Advocate organizations",
    call_center: "Duty staff",
    sales: "Sales",
  },
};
