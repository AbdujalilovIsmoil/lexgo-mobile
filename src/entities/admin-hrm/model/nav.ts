import type { IconName } from "@/shared/ui";

// Same codes as entities/access InternalPermission (kept local: entities do not import each other).
export type HrmPerm = "internal_hr.manage" | "internal_org.manage" | "internal_execution.manage" | "internal_time.manage" | "internal_payroll.manage" | "internal_kpi.manage" | "internal_analytics.view";
export type HrmNavItem = { key: string; icon: IconName; color: string; perm?: HrmPerm };
export type HrmNavGroup = { key: string; items: HrmNavItem[] };

// Sub-areas of /manage/internal, grouped and permission-gated exactly like the web InternalShell sidebar.
export const HRM_NAV: HrmNavGroup[] = [
  { key: "workspace", items: [
    { key: "dashboard", icon: "home", color: "#3B82F6" },
    { key: "me", icon: "user", color: "#8B5CF6" },
    { key: "tasks", icon: "check-square", color: "#F59E0B" },
    { key: "attendance", icon: "calendar", color: "#22C55E" },
    { key: "approvals", icon: "shield", color: "#6366F1" },
    { key: "messages", icon: "message-circle", color: "#EC4899" },
  ] },
  { key: "people", items: [
    { key: "employees", icon: "users", color: "#06B6D4", perm: "internal_hr.manage" },
    { key: "org", icon: "git-merge", color: "#8B5CF6", perm: "internal_org.manage" },
  ] },
  { key: "operations", items: [
    { key: "execution", icon: "briefcase", color: "#F59E0B", perm: "internal_execution.manage" },
    { key: "time", icon: "clock", color: "#22C55E", perm: "internal_time.manage" },
    { key: "schedules", icon: "calendar", color: "#3B82F6", perm: "internal_time.manage" },
    { key: "kpi", icon: "target", color: "#EF4444", perm: "internal_kpi.manage" },
    { key: "payroll", icon: "credit-card", color: "#22C55E", perm: "internal_payroll.manage" },
    { key: "analytics", icon: "bar-chart-2", color: "#6366F1", perm: "internal_analytics.view" },
  ] },
];
export const HRM_PERMS: Record<string, HrmPerm | undefined> = Object.fromEntries(HRM_NAV.flatMap((g) => g.items).map((i) => [i.key, i.perm]));
