import type { Messages } from "../uz";

export const ag2: Messages["ag2"] = {
  download: "Download as Excel",
  failed: "Export failed",
  sheetHint: "Pick the period and filter; the file is shared as Excel (.xlsx)",
  period: "Period",
  noPeriod: "All data (no period)",
  withPeriod: "Filter by period",
  count: "{n} exports",
  none: "No exports are open to you",
  by: { role: "Role", status: "Status" },
  role: { client: "Client", yurist: "Lawyer", advokat: "Advocate", advokat_tashkiloti: "Law firm", manager: "Manager", call_center: "Call centre", admin: "Admin" },
  exp: {
    dashboard: "Dashboard", system: "System report", users: "Users", lawyers: "Professionals",
    sellerRequests: "Registration requests", reviews: "Reviews", complaints: "Complaints", tasks: "Tasks",
    payments: "Payments", payouts: "Seller payouts", subscriptions: "Subscriptions", plans: "Subscription plans",
    categories: "Service categories", templates: "Document templates", orders: "Marketplace orders", sellers: "Marketplace sellers",
    promotions: "Ad campaigns", leads: "Leads funnel", studio: "Studio objects", hrm: "Internal analytics",
  },
};
