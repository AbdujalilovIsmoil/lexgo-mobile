import type { ReactNode } from "react";
import { Redirect } from "expo-router";
import { useIsAuthed } from "@/entities/session";
import { moduleByKey } from "../model/modules";
import { useAccess } from "../model/useAccess";

// Wraps the route of an admin module: signed-out → login; a user whose roles and
// permissions don't cover the module never sees it (back to the hub, or Home).
export function AdminGate({ id, children }: { id: string; children: ReactNode }) {
  const authed = useIsAuthed();
  const a = useAccess();
  const mod = moduleByKey(id);
  if (!authed) return <Redirect href="/auth/login" />;
  if (!mod || !mod.visible(a)) return <Redirect href={(a.staff ? "/(tabs)/admin" : "/") as never} />;
  return <>{children}</>;
}
