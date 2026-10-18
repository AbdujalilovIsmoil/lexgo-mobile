import { useEffect } from "react";
import { useAccess } from "@/entities/access";
import { useSession } from "@/entities/session";
import { useSupportLive, useUnreadTotal } from "@/entities/support";
import { setBadge } from "@/shared/lib/badgeStore";

// Unread operator messages → the "support" badge of the Profile menu. Call-center and staff
// accounts keep their own number (the ticket queue), so they are left alone.
export function useSupportBadge(): void {
  const signedIn = Boolean(useSession());
  const a = useAccess();
  const enabled = signedIn && !a.callCenter && !a.staff;
  const total = useUnreadTotal(enabled).data;
  useSupportLive();
  useEffect(() => {
    if (enabled && typeof total === "number") setBadge("support", total);
  }, [enabled, total]);
}
