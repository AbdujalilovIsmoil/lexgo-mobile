import { useAccess } from "@/entities/access";
import { useSession } from "@/entities/session";
import type { TabRole } from "./tabConfig";

// guest → signed out; staff → admin/internal/studio access; callcenter → operator
// (call_center role, not an admin); seller → advokat/yurist/organization;
// everyone else → client. Decided from the backend role/permissions, never from a client toggle.
export function useTabRole(): TabRole {
  const user = useSession()?.user;
  const a = useAccess();
  if (!user) return "guest";
  if (a.isFullAdmin) return "staff";
  if (a.roles.includes("call_center") && !a.seller) return "callcenter";
  if (a.seller) return "seller";
  return a.staff ? "staff" : "client";
}
