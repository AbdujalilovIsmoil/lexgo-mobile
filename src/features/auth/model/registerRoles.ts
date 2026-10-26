// Account kinds the mobile app signs up (the roles it serves; an organisation registers on the web).
export const REGISTER_ROLES = ["client", "yurist", "advokat"] as const;
export type RegisterRole = (typeof REGISTER_ROLES)[number];

export const REGISTER_ICONS = { client: "user", yurist: "briefcase", advokat: "shield" } as const;

// Regions the web offers (law-main lib/lawyers.ts); the key is what the backend stores.
export const REGIONS = ["tashkent", "samarkand", "fergana", "bukhara", "namangan", "andijan", "kashkadarya", "khorezm", "jizzakh", "navoi"] as const;

export const isSellerRole = (r: string): boolean => r !== "client";
