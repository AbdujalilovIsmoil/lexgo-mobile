import type { Messages } from "../uz";

export const py3: Messages["py3"] = {
  active: "Active",
  details: "Details",
  prepaid: "Prepaid",
  functions: "What the plan includes",
  unlimited: "unlimited",
  autoProvider: "Auto-payment: {p}",
  footer: "Prices are in UZS. A plan becomes active once the server confirms the payment.",
  auto: {
    title: "Auto-renew",
    hint: "The plan renews by itself when the term ends.",
    card: "Card",
    on: "Auto-renew is on",
    off: "Auto-renew is off",
  },
  checkout: {
    title: "Get this plan",
    pay: "Pay",
    telegram: "Request via Telegram",
    period: "Term",
    total: "Total",
    note: "The payment is only created as pending. The plan turns on once the server confirms it.",
    fallback: "Online payment is not connected yet — the request was sent via Telegram.",
    requested: "Request sent ({id}). The plan turns on after an operator approves it.",
    done: "Done",
    all: "All payments",
  },
  pending: { title: "Requests awaiting approval", fallback: "Plan request" },
  other: { show: "Other plans ({n})", hide: "Hide other plans" },
};
