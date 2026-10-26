import { useSession } from "@/entities/session";
import type { TabRole } from "./tabConfig";

// guest → signed out; seller → advokat / yurist; client → everyone else signed in (the app serves no other role: see
// entities/session isMobileAccount). Decided from the backend role, never from a client toggle.
export function useTabRole(): TabRole {
  const role = useSession()?.user.role;
  if (!role) return "guest";
  return role === "client" ? "client" : "seller";
}
