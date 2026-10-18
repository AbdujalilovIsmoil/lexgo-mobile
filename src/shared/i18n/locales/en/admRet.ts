import type { Messages } from "../uz";

export const admRet: Messages["admRet"] = {
  atRisk: "At risk",
  churned: "Churned this month",
  retained: "Retained",
  atRiskTitle: "At-risk clients",
  noRisk: "No at-risk clients",
  winBack: "Win back",
  winBackDone: "{name} added to the win-back queue",
  adding: "Adding…",
  upsellTitle: "Upsell suggestions",
  noUpsell: "No suggestions",
  reason: { subscription_expiring: "Subscription expiring", no_paid_activity_30_days: "No payment in 30 days", no_paid_history: "Never paid" },
  lastPaid: "Last payment: {date}",
  neverPaid: "No payment history",
  noClientId: "This client cannot be queued (no id)",
  demoAction: "Demo row — no action taken",
  price: "Price",
  off: "Retention is switched off on the server",
  offText: "The server answers 404 on the /retention routes. Once the module is enabled, clients at risk will appear here. Tap “Demo” for a sample.",
};
