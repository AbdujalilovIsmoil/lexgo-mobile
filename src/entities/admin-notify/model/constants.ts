// GET /admin/users?role= values; "all" is the unfiltered list.
export const ROLE_TABS = ["all", "client", "yurist", "advokat", "advokat_tashkiloti", "call_center", "sales"] as const;
export type RoleTab = (typeof ROLE_TABS)[number];
export const BROADCAST_ROLES = ROLE_TABS.filter((r) => r !== "all");

export const CHANNELS = ["push", "telegram", "email", "sms"] as const;
export const CATEGORIES = ["orders", "payments", "chat", "documents", "system", "marketing"] as const;
// Parallel sends per batch: quick enough, polite to the backend.
export const CONCURRENCY = 3;
