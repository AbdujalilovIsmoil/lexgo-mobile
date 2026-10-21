import { useAccess, webSidebarOnly } from "@/entities/access";
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
  if (a.salesOperator) return "sales";
  return a.staff ? "staff" : "client";
}

// Whether the role's own drawer (ClientSidebar) lists the admin screens itself, so the admin module switcher is not drawn on them: a
// sales operator, and an on-duty call-centre lawyer working as a professional (the web's "Navbatchi yurist").
export function useOwnSidebar(): boolean {
  const a = useAccess();
  const role = useTabRole();
  return a.salesOperator || (role === "seller" && webSidebarOnly(a));
}
