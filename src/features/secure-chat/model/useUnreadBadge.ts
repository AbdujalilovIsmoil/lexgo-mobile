import { useEffect } from "react";
import { setBadge } from "@/shared/lib/badgeStore";
import { useSocketState } from "@/shared/realtime";
import { unreadTotal, useRooms } from "@/entities/secure-chat";
import { useSession } from "@/entities/session";
import { useRoomsLive } from "./useRoomsLive";

// App-wide (mounted in MsgMounts): keeps the room list fresh in the background and the "Xabarlar" tab badge in step
// with the unread counters of MY rooms, whichever screen is open.
export function useUnreadBadge(): void {
  const myId = useSession()?.user.id ?? "";
  const rooms = useRooms(useSocketState() === "online", myId);
  useRoomsLive();
  const n = myId ? unreadTotal(rooms.data ?? [], myId) : 0;
  useEffect(() => setBadge("messages", n), [n]);
}
