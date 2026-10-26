import { useEffect } from "react";
import { useSession } from "@/entities/session";
import { useSupportLive, useUnreadTotal } from "@/entities/support";
import { setBadge } from "@/shared/lib/badgeStore";

// Unread operator messages → the "support" badge of the Profile menu.
export function useSupportBadge(): void {
  const enabled = Boolean(useSession());
  const total = useUnreadTotal(enabled).data;
  useSupportLive();
  useEffect(() => {
    if (enabled && typeof total === "number") setBadge("support", total);
  }, [enabled, total]);
}
