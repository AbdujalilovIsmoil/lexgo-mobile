import type { ExportDef } from "./types";

// Excel exports of the admin area (TZ 46.2 `*/export.xlsx`). A period (date_from / date_to) is honoured by all of them
// except the studio one; a few take one extra filter. Visibility mirrors the permission of the module that owns the data.
export const CORE_EXPORTS: ExportDef[] = [
  { key: "dashboard", path: "/admin/dashboard/export.xlsx", icon: "grid", visible: (a) => a.admin && a.can(), dates: true },
  { key: "system", path: "/admin/system/export.xlsx", icon: "server", visible: (a) => a.admin && a.can(), dates: true },
  { key: "users", path: "/admin/users/export.xlsx", icon: "users", visible: (a) => a.can("users.manage"), dates: true, filter: { param: "role", options: ["client", "yurist", "advokat", "advokat_tashkiloti", "call_center", "admin"], i18n: "ag2.role" } },
  { key: "lawyers", path: "/admin/lawyers/export.xlsx", icon: "briefcase", visible: (a) => a.can("lawyers.verify"), dates: true },
  { key: "sellerRequests", path: "/admin/seller-requests/export.xlsx", icon: "user-plus", visible: (a) => a.can("users.manage"), dates: true, filter: { param: "status", options: ["pending", "approved", "rejected"], i18n: "admSt" } },
  { key: "reviews", path: "/admin/reviews/export.xlsx", icon: "star", visible: (a) => a.can("lawyers.verify"), dates: true, filter: { param: "status", options: ["pending", "approved", "active", "rejected"], i18n: "admSt" } },
  { key: "complaints", path: "/admin/complaints/export.xlsx", icon: "alert-triangle", visible: (a) => a.can("lawyers.verify"), dates: true },
  { key: "tasks", path: "/admin/tasks/export.xlsx", icon: "check-square", visible: (a) => a.admin && a.can(), dates: true, filter: { param: "status", options: ["todo", "doing", "review", "done"], i18n: "admSt" } },
];
