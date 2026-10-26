import { useSegments } from "expo-router";

// Screens that need the whole width (rooms, calls, auth, the assistant): no sidebar there. Every role has one.
const HIDE = new Set(["auth", "chat", "call", "lawyer", "assistant", "instructor", "specialist"]);

// Whether the current route shows no sidebar at all (drawer on a phone, docked column on a wide tablet).
export function useSidebarHidden(): boolean {
  const seg = useSegments();
  return HIDE.has(String(seg[0])) || (seg[0] === "(tabs)" && seg[1] === "ai");
}
