import { item, type MenuSection } from "./types";

// Professional (advokat / yurist / organization) tools that have no tab of their own.
export const PRO_SECTIONS: MenuSection[] = [
  { key: "pro", items: [item("proProfile", "user-check", "/pro/profile"), item("onboarding", "clipboard", "/pro/onboarding"), item("proServices", "briefcase", "/pro/services"), { ...item("proPackages", "package", "/pro/packages"), label: "ntd.sellerV2.menuPackages" }, item("availability", "clock", "/pro/availability"), item("promotions", "radio", "/pro/promotions")] },
  { key: "proWork", items: [item("proDocs", "file-text", "/pro/docs"), item("proOrders", "shopping-bag", "/pro/orders"), item("proUrgent", "zap", "/pro/urgent"), item("cases", "folder", "/pro/cases"), item("calendar", "calendar", "/pro/calendar"), item("tasks", "check-circle", "/pro/tasks"), item("files", "hard-drive", "/pro/files"), item("stats", "bar-chart-2", "/pro/stats")] },
  { key: "billing", items: [item("subscription", "star", "/subscription"), item("referral", "share-2", "/pro/referrals"), item("support", "headphones", "/support", "support")] },
];

export const ORG_SECTION: MenuSection = { key: "org", items: [item("org", "briefcase", "/org"), item("orgMembers", "users", "/org/members"), item("orgWorkload", "activity", "/org/workload")] };
export const POOL_ITEM = item("docPool", "inbox", "/pro/docs/pool");
