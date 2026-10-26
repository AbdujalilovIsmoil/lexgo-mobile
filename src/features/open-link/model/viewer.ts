import { useMemo } from "react";
import { useSession, useSessionStore, type User } from "@/entities/session";
import type { Viewer } from "@/shared/links";

// Same split as the tab bar (widgets/tab-bar/useTabRole): an advokat / yurist is a professional, everyone else a client.
export function viewerOf(user: User | null | undefined): Viewer {
  if (!user) return { signedIn: false, kind: "client" };
  return { signedIn: true, kind: user.role === "client" ? "client" : "seller" };
}

export function useViewer(): Viewer {
  const user = useSession()?.user;
  return useMemo(() => viewerOf(user), [user]);
}

// For code outside React (notification taps, the background task, +native-intent).
export const currentViewer = (): Viewer => viewerOf(useSessionStore.getState().session?.user);
