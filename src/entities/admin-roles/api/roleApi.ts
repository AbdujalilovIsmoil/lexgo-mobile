import { http } from "@/shared/api";
import { asArr, asDict, asStr } from "@/shared/lib/json";
import type { Permission, PermissionMatrix, Role, RoleInput } from "../model/types";

const strs = (v: unknown) => asArr(v).map((p) => asStr(p));

function normRole(v: unknown): Role {
  const d = asDict(v);
  return { id: asStr(d.id), name: asStr(d.name), title: asStr(d.title ?? d.name), description: asStr(d.description), permissions: strs(d.permissions), createdAt: asStr(d.created_at ?? d.createdAt) };
}

// Permissions arrive as {code, title}; older builds sent plain codes.
const normPermission = (p: unknown): Permission => {
  const code = typeof p === "string" ? p : asStr(asDict(p).code);
  return { code, title: (typeof p === "string" ? "" : asStr(asDict(p).title)) || code };
};

// GET /admin/roles — a plain list (roles.manage).
export async function listRoles(): Promise<Role[]> {
  return asArr(await http("/admin/roles")).map(normRole);
}

// GET /admin/permissions — every permission code with its human title.
export async function listPermissions(): Promise<Permission[]> {
  return asArr(await http("/admin/permissions")).map(normPermission).filter((p) => p.code);
}

// GET /admin/permission-matrix — roles with their codes, all permissions, and the seller-type rules.
export async function getMatrix(): Promise<PermissionMatrix> {
  const d = asDict(await http("/admin/permission-matrix"));
  const rules = asDict(d.seller_rules);
  return {
    roles: asArr(d.roles).map(normRole),
    permissions: asArr(d.permissions).map(normPermission).filter((p) => p.code),
    sellerRules: Object.keys(rules).map((k) => {
      const v = asDict(rules[k]);
      return { sellerType: asStr(v.seller_type ?? k), blockedPrefixes: strs(v.blocked_service_prefixes), rule: asStr(v.rule) };
    }),
  };
}

// POST /admin/roles {name, title, description, permissions[]}.
export async function createRole(input: RoleInput): Promise<Role> {
  return normRole(await http("/admin/roles", { method: "POST", body: input }));
}

// POST /admin/users/assign-role {user_id, role_id}.
export async function assignRole(userId: string, roleId: string): Promise<void> {
  await http("/admin/users/assign-role", { method: "POST", body: { user_id: userId, role_id: roleId } });
}
