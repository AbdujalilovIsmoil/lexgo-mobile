import { useMemo } from "react";
import { useSession } from "@/entities/session";
import { buildAccess, type Access } from "./access";

// What the signed-in user may open, derived from their roles and permissions.
export function useAccess(): Access {
  const user = useSession()?.user;
  return useMemo(() => buildAccess(user), [user]);
}
