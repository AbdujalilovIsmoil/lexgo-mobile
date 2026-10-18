// Roles that must use 2FA at login and cannot turn it off (DELETE /auth/2fa answers 403).
const MANDATORY = ["yurist", "advokat", "advokat_tashkiloti", "admin", "superadmin", "manager", "call_center", "sales"];

type Who = { role: string; backendRole: string; roles: string[] };

// Decided from roles only, like requiresTwoFactor() in lib/auth.tsx on the web.
export function requiresTwoFactor(u: Who | null | undefined): boolean {
  if (!u) return false;
  if (u.role !== "client") return true;
  return [u.backendRole, ...u.roles].some((r) => MANDATORY.includes(r) || r.startsWith("call_center") || r.startsWith("sales"));
}
