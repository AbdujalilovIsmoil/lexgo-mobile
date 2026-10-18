// Account kinds the backend accepts at /auth/register/start (UserRole, public part).
export const REGISTER_ROLES = ["client", "yurist", "advokat", "advokat_tashkiloti"] as const;
export type RegisterRole = (typeof REGISTER_ROLES)[number];

export const REGISTER_ICONS = { client: "user", yurist: "briefcase", advokat: "shield", advokat_tashkiloti: "users" } as const;

// Regions the web offers (law-main lib/lawyers.ts); the key is what the backend stores.
export const REGIONS = ["tashkent", "samarkand", "fergana", "bukhara", "namangan", "andijan", "kashkadarya", "khorezm", "jizzakh", "navoi"] as const;

export const isSellerRole = (r: string): boolean => r !== "client";
