// Permission and role vocabulary used by the web panel (law-main lib/auth.tsx,
// lib/services/internalHrm.ts, lib/services/studio.ts), mirrored 1:1.

// Codes that unlock at least one /admin page. orders/meetings/organizations
// .manage are NOT here: sellers hold them by default and are not staff.
export const ADMIN_PERMISSIONS = [
  "leads.manage",
  "services.manage",
  "subscriptions.manage",
  "templates.manage",
  "ads.manage",
  "users.manage",
  "lawyers.verify",
  "approvals.manage",
  "legal_aid.manage",
  "notifications.manage",
  "roles.manage",
  "payments.manage",
  "callcenter.access",
] as const;

export const INTERNAL_PERMISSIONS = [
  "internal_hr.manage",
  "internal_org.manage",
  "internal_execution.manage",
  "internal_time.manage",
  "internal_payroll.manage",
  "internal_kpi.manage",
  "internal_analytics.view",
] as const;
export type InternalPermission = (typeof INTERNAL_PERMISSIONS)[number];

export const FULL_ADMIN_ROLES = ["admin", "superadmin"];
export const MANAGER_ROLES = ["manager"];
export const INTERNAL_STAFF_ROLES = ["employee", "internal_employee", "internal_staff", "staff", "hr"];
export const STUDIO_ROLES = ["studio_editor", "studio_reviewer", "studio_publisher", "studio_admin"];
export const MANAGER_INTERNAL = new Set<string>(["internal_execution.manage", "internal_time.manage", "internal_kpi.manage", "internal_analytics.view"]);
