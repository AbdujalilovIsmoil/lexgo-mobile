import type { Messages } from "../uz";

export const sl10: Messages["sl10"] = {
  running: "Running promotions",
  noneTitle: "No running promotion",
  noneText: "Promote your profile or a service: it shows higher in the marketplace.",
  until: "until {date}",
  daysLeft: "{n} d left",
  pending: {
    title: "Waiting for approval",
    text: "An admin approves the payment in Telegram. The promotion turns on automatically afterwards — the app never marks a payment as paid.",
    waiting: "Waiting",
    notSent: "Not sent to Telegram",
  },
  analytics: "Analytics",
  a: {
    impressions: "Impressions",
    search: "Search appearances",
    clicks: "Profile clicks",
    contacts: "Contact requests",
    spend: "Active package cost",
  },
  noSeries: "Not enough data for the chart yet",
  toast: { approved: "Promotion approved and live", rejected: "Promotion request rejected" },
  live: "Visible to clients",
};
