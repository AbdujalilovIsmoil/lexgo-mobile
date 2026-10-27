import { useQueryClient } from "@tanstack/react-query";
import { useUserEvents } from "@/shared/realtime";
import { asStr } from "@/shared/lib/json";
import { applyRoomEvent, chatKeys, type Room } from "@/entities/secure-chat";
import { useSession } from "@/entities/session";

// Folds secure_chat.* user-socket events into the cached room list (new message → room jumps to the top with its
// preview and unread count; my own read → badge cleared). A room we do not know yet triggers a refetch. A room turned read-only
// (refund, reassignment, completion) is read again with its order; a cancellation discussion room that opened or closed refreshes the list.
export function useRoomsLive(): void {
  const qc = useQueryClient();
  const myId = useSession()?.user.id ?? "";
  useUserEvents(["marketplace.cancellation_chat_created", "marketplace.cancellation_chat_closed"], () => void qc.invalidateQueries({ queryKey: chatKeys.rooms }));
  useUserEvents("secure_chat.", (e) => {
    if (e.event === "secure_chat.read_only") {
      const id = asStr(e.room_id);
      void qc.invalidateQueries({ queryKey: chatKeys.rooms });
      if (id) void qc.invalidateQueries({ queryKey: chatKeys.room(id) });
      ["market-orders", "pro-order"].forEach((k) => void qc.invalidateQueries({ queryKey: [k] }));
      return;
    }
    const cur = qc.getQueryData<Room[]>(chatKeys.rooms);
    const next = cur ? applyRoomEvent(cur, e, myId) : null;
    if (next === null) void qc.invalidateQueries({ queryKey: chatKeys.rooms });
    else if (next !== cur) qc.setQueryData(chatKeys.rooms, next);
  });
}
