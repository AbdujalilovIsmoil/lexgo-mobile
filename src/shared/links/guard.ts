import type { Viewer } from "./types";

// Who may open which part of the app (UI hiding is not security: the backend 403 stays final, this
// only keeps a link from landing a user inside another role's area).
export function mayOpen(href: string, v: Viewer): boolean {
  const path = href.split("?")[0];
  // Whole segments only: "/profile/gifts" is a client screen, not part of "/pro/…".
  const under = (base: string): boolean => path === base || path.startsWith(`${base}/`);
  if (under("/pro")) return v.kind === "seller";
  if (under("/org")) return v.kind === "seller" && v.orgOwner;
  if (under("/cc")) return v.kind === "callcenter" || v.kind === "staff" || v.callCenterLawyer;
  if (under("/manage")) return v.kind === "staff";
  return true;
}

// The screen a viewer lands on when a link cannot be honoured.
export function safeHome(v: Viewer): string {
  if (!v.signedIn) return "/";
  return v.kind === "seller" ? "/(tabs)/workspace" : v.kind === "callcenter" ? "/(tabs)/leads" : v.kind === "staff" ? "/(tabs)/admin" : "/";
}
