import { useQueryClient } from "@tanstack/react-query";
import { useUserEvents } from "@/shared/realtime";
import { applyRoomEvent, chatKeys, type Room } from "@/entities/secure-chat";
import { useSession } from "@/entities/session";

// Folds secure_chat.* user-socket events into the cached room list (new message → room jumps to the top with its
// preview and unread count; my own read → badge cleared). A room we do not know yet triggers a refetch.
export function useRoomsLive(): void {
  const qc = useQueryClient();
  const myId = useSession()?.user.id ?? "";
  useUserEvents("secure_chat.", (e) => {
    const cur = qc.getQueryData<Room[]>(chatKeys.rooms);
    const next = cur ? applyRoomEvent(cur, e, myId) : null;
    if (next === null) void qc.invalidateQueries({ queryKey: chatKeys.rooms });
    else if (next !== cur) qc.setQueryData(chatKeys.rooms, next);
  });
}
