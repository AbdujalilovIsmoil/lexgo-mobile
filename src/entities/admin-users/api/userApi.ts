import { http } from "@/shared/api";
import { asArr, asDict, asStr, listFrom } from "@/shared/lib/json";
import type { UserHit } from "../model/types";

export function normUserHit(v: unknown): UserHit {
  const d = asDict(v);
  return {
    id: asStr(d.id),
    lexgoId: asStr(d.lexgo_id),
    name: asStr(d.name) || [asStr(d.first_name), asStr(d.last_name)].filter(Boolean).join(" "),
    phone: asStr(d.phone),
    role: asStr(d.role, "client"),
    status: asStr(d.account_status ?? d.status, "active"),
    roles: asArr(d.roles).map((r) => asStr(r)),
    permissions: asArr(d.permissions).map((r) => asStr(r)),
    createdAt: asStr(d.created_at),
  };
}

// GET /users/search?q= — any signed-in staff; name, phone or LexGo id.
export async function searchUsers(q: string, limit = 20): Promise<UserHit[]> {
  return listFrom(await http(`/users/search?${new URLSearchParams({ q, limit: String(limit) })}`), "items", "data", "users").map(normUserHit);
}

// GET /admin/users?role=&q=&status= — needs users.manage; the endpoint returns the whole filtered list.
export async function listAdminUsers(f: { role?: string; q?: string; status?: string } = {}): Promise<UserHit[]> {
  const qs = new URLSearchParams();
  Object.entries(f).forEach(([k, v]) => v && qs.set(k, v));
  return listFrom(await http(`/admin/users${qs.size ? `?${qs}` : ""}`), "items", "data", "users").map(normUserHit);
}
