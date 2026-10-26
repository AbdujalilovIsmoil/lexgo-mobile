import type { Viewer } from "./types";

// Who may open which part of the app (UI hiding is not security: the backend 403 stays final, this
// only keeps a link from landing a client inside the professional's area).
export function mayOpen(href: string, v: Viewer): boolean {
  const path = href.split("?")[0];
  // Whole segments only: "/profile/gifts" is a client screen, not part of "/pro/…".
  if (path === "/pro" || path.startsWith("/pro/")) return v.kind === "seller";
  return true;
}

// The screen a viewer lands on when a link cannot be honoured.
export const safeHome = (v: Viewer): string => (v.signedIn && v.kind === "seller" ? "/(tabs)/workspace" : "/");
