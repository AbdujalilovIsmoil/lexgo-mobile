import type { AdminModule } from "./moduleTypes";

// Modules added by the TZ gap audit (users directory + client 360, complaints, lawyer tasks, service packages,
// upsell, academy, Excel export centre). Same rules: a permission code, or full-admin only without one.
export const ADM_MODULES: AdminModule[] = [
  { key: "adminTasks", group: "command", icon: "check-square", color: "#22C55E", visible: (a) => a.admin && a.can("cases.manage") },
  { key: "packages", group: "catalog", icon: "package", color: "#06B6D4", visible: (a) => a.admin && a.can(["packages.create", "packages.approve", "services.manage"]) },
  { key: "upsell", group: "catalog", icon: "trending-up", color: "#F59E0B", visible: (a) => a.admin && a.can(["subscriptions.manage", "sales.access"]) },
  { key: "academy", group: "catalog", icon: "book-open", color: "#8B5CF6", visible: (a) => a.admin && a.can("academy.manage") },
  { key: "users", group: "sellers", icon: "users", color: "#3B82F6", visible: (a) => a.admin && a.can("users.manage") },
  { key: "complaints", group: "sellers", icon: "alert-triangle", color: "#EF4444", visible: (a) => a.admin && a.can(["lawyers.verify", "cases.manage"]) },
  { key: "exports", group: "system", icon: "download", color: "#22C55E", visible: (a) => a.staff },
];
