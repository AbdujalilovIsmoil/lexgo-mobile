import { asArr, asDict } from "@/shared/lib/json";
import type { StudioGrant, StudioRoute } from "../model/typesAdmin";
import { boolOf, first, lower, personOf, timeOf } from "./norm";

export function normRoute(raw: unknown): StudioRoute {
  const r = asDict(raw);
  return {
    id: first(r.id, r.route_id),
    code: first(r.constructor_code, r.code),
    title: first(r.title, r.name),
    steps: asArr(r.steps).map((s) => ({ role: first(asDict(s).role, asDict(s).required_role), title: first(asDict(s).title, asDict(s).name) })),
    status: lower(r.status) || "active",
    updatedAt: timeOf(r.updated_at, r.created_at),
  };
}

export function normGrant(raw: unknown): StudioGrant {
  const r = asDict(raw);
  const u = asDict(r.user);
  const roles = asArr(r.roles).map((x) => first(x)).filter(Boolean);
  const codes = asArr(r.constructor_codes ?? r.codes).map((x) => first(x)).filter((c) => c && c !== "*");
  return {
    id: first(r.id, r.grant_id),
    userId: first(r.user_id, u.id),
    userName: first(r.user_name, personOf(u), r.name),
    phone: first(r.phone, u.phone),
    lexgoId: first(r.lexgo_id, u.lexgo_id),
    roles: roles.length ? roles : [first(r.role)].filter(Boolean),
    codes,
    active: boolOf(r.is_active ?? r.active) ?? lower(r.status) !== "inactive",
    createdAt: timeOf(r.created_at, r.granted_at),
  };
}
