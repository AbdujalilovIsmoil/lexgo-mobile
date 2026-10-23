import { useSegments } from "expo-router";
import { useOwnSidebar } from "@/widgets/tab-bar/useTabRole";

// Screens that need the whole width (rooms, calls, auth, the assistant): no sidebar there. Every role has one.
// The admin area has its own module switcher on the same edge, so it gets no second handle (`manage`, see below) — except for a
// sales operator or an on-duty call-centre lawyer, whose sidebar rows already include those screens: they keep this sidebar and no module switcher is drawn.
const HIDE = new Set(["auth", "chat", "call", "lawyer", "assistant", "instructor", "specialist", "sel-dev", "cc-preview"]);

// Whether the current route shows no sidebar at all (drawer on a phone, docked column on a wide tablet).
export function useSidebarHidden(): boolean {
  const seg = useSegments();
  const ownSidebar = useOwnSidebar();
  const manage = seg[0] === "manage" && (!ownSidebar || seg[1] === "call" || seg[1] === "chat");
  return HIDE.has(String(seg[0])) || manage || (seg[0] === "(tabs)" && seg[1] === "ai");
}
