import type { Messages } from "../uz";

export const py4: Messages["py4"] = {
  title: "What my plan gives",
  planFallback: "Plan",
  daysLeft: "{n} days left",
  family: "family members: {n}",
  autoUnknown: "The server does not report the current state; your last choice is remembered.",
  plans: "View plans",
  ai: "AI requests: {v}",
  source: "Source: {s}",
  docs: { title: "Documents", templates: "Ready document templates", download: "Template download", fill: "Manual document filling" },
  shared: { title: "Family members using the plan", none: "Nobody has been given access yet.", manage: "Manage family" },
  none: { title: "No active plan", text: "Pick a plan — what it gives shows up here." },
};
