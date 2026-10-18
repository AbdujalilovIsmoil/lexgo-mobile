import { useMemo } from "react";
import { buildAccess } from "@/entities/access";
import { useSession, useSessionStore, type User } from "@/entities/session";
import type { Viewer } from "@/shared/links";

// Same split as the tab bar (widgets/tab-bar/useTabRole): staff → call-center operator → seller → client.
export function viewerOf(user: User | null | undefined): Viewer {
  if (!user) return { signedIn: false, kind: "client", orgOwner: false, callCenterLawyer: false };
  const a = buildAccess(user);
  const kind = a.isFullAdmin ? "staff" : a.roles.includes("call_center") && !a.seller ? "callcenter" : a.seller ? "seller" : a.staff ? "staff" : "client";
  return { signedIn: true, kind, orgOwner: a.orgOwner, callCenterLawyer: a.callCenterLawyer };
}

export function useViewer(): Viewer {
  const user = useSession()?.user;
  return useMemo(() => viewerOf(user), [user]);
}

// For code outside React (notification taps, the background task, +native-intent).
export const currentViewer = (): Viewer => viewerOf(useSessionStore.getState().session?.user);
