import type { User } from "../model/types";

// What the app does with an account (TZ 3.2: login → account `active` → onboarding → permissions).
// pending = waiting for an admin (soft gate, onboarding stays reachable); the rest cannot be used.
export type AccountGate = "ok" | "pending" | "blocked" | "deleted" | "rejected" | "restricted";

export function accountGate(status: string | undefined): AccountGate {
  const s = (status ?? "").trim().toLowerCase();
  if (!s || /^(active|approved|verified|enabled)$/.test(s)) return "ok";
  if (s.startsWith("pending") || s === "awaiting_approval" || s === "under_review") return "pending";
  if (/block|ban|suspend/.test(s)) return "blocked";
  if (/delet|remov|closed/.test(s)) return "deleted";
  if (/reject|declin|denied/.test(s)) return "rejected";
  return "restricted";
}

// Sellers (yurist / advokat) finish a profile before an admin approves them.
export const isSellerUser = (u: Pick<User, "backendRole" | "roles">): boolean => [u.backendRole, ...u.roles].some((r) => r === "yurist" || r === "advokat");

// Fields the server did not send (undefined) never erase what is already stored.
export function mergeUser(cur: User, next: User): User {
  const out: Record<string, unknown> = { ...cur };
  for (const [k, v] of Object.entries(next)) if (v !== undefined) out[k] = v;
  return out as User;
}
