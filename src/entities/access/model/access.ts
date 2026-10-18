import type { User } from "@/entities/session";
import { ADMIN_PERMISSIONS, FULL_ADMIN_ROLES, INTERNAL_PERMISSIONS, INTERNAL_STAFF_ROLES, MANAGER_INTERNAL, MANAGER_ROLES, STUDIO_ROLES, type InternalPermission } from "./roles";

export type Access = {
  roles: string[];
  perms: string[];
  isSuper: boolean;
  isFullAdmin: boolean;
  seller: boolean;
  orgOwner: boolean; // advokat_tashkiloti / organization_owner
  callCenterLawyer: boolean; // may take open document and urgent pool work
  callCenterOperator: boolean; // call_center role (not a lawyer, not an admin)
  admin: boolean; // may open at least one admin screen
  internal: boolean; // may open the internal (HRM) area
  callCenter: boolean;
  canCalls: boolean; // may start calls and meetings
  studioRole: boolean;
  staff: boolean; // admin || internal || studio
  /** One code, or a list where any is enough. No argument = full-admin only (as in the web nav). */
  can: (perm?: string | string[]) => boolean;
  canInternal: (perm: InternalPermission) => boolean;
};

const has = (list: readonly string[], v: string) => list.includes(v);

// Assigned roles plus the primary backend role, lower-cased and unique.
export function rolesOf(user: User | null | undefined): string[] {
  if (!user) return [];
  return [...new Set([...(user.roles ?? []), user.backendRole ?? ""].map((r) => r.trim().toLowerCase()).filter(Boolean))];
}

export function buildAccess(user: User | null | undefined): Access {
  const roles = rolesOf(user);
  const perms = user?.permissions ?? [];
  const isSuper = has(roles, "superadmin");
  const isFullAdmin = isSuper || has(roles, "admin");
  const seller = user?.role === "lawyer" || user?.role === "advocate";
  const orgOwner = user?.backendRole === "advokat_tashkiloti" || has(roles, "organization_owner");
  const callCenterLawyer = has(roles, "call_center_lawyer");
  const callCenterOperator = has(roles, "call_center") && !seller && !isFullAdmin;
  const admin = isFullAdmin || perms.some((p) => has(ADMIN_PERMISSIONS, p));
  const callCenter = has(perms, "callcenter.access") || roles.some((r) => r === "call_center" || r === "call_center_lawyer");
  const canCalls = has(perms, "meetings.manage") || roles.some((r) => r.includes("call_center"));
  const internal =
    roles.some((r) => FULL_ADMIN_ROLES.includes(r) || MANAGER_ROLES.includes(r) || INTERNAL_STAFF_ROLES.includes(r) || r.startsWith("internal_")) || perms.some((p) => has(INTERNAL_PERMISSIONS, p));
  const studioRole = isFullAdmin || has(roles, "studio_admin") || roles.some((r) => has(STUDIO_ROLES, r));
  return {
    roles,
    perms,
    isSuper,
    isFullAdmin,
    seller,
    orgOwner,
    callCenterLawyer,
    callCenterOperator,
    admin,
    internal,
    callCenter,
    canCalls,
    studioRole,
    staff: admin || internal || studioRole,
    can: (perm) => (isSuper ? true : perm === undefined ? isFullAdmin : (Array.isArray(perm) ? perm : [perm]).some((p) => has(perms, p))),
    canInternal: (perm) => {
      if (roles.some((r) => FULL_ADMIN_ROLES.includes(r))) return true;
      if (roles.some((r) => MANAGER_ROLES.includes(r)) && MANAGER_INTERNAL.has(perm)) return true;
      return has(perms, perm);
    },
  };
}
