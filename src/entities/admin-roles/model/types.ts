export type Permission = { code: string; title: string };
export type Role = { id: string; name: string; title: string; description: string; permissions: string[]; createdAt: string };
export type SellerRule = { sellerType: string; blockedPrefixes: string[]; rule: string };
export type PermissionMatrix = { roles: Role[]; permissions: Permission[]; sellerRules: SellerRule[] };
export type RoleInput = { name: string; title: string; description: string; permissions: string[] };
