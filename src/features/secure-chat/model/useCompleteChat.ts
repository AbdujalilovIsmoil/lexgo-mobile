import { useQueryClient } from "@tanstack/react-query";
import { chatKeys, completeUrgentChat, type Room } from "@/entities/secure-chat";
import { useAdminMutation } from "@/shared/lib/useAdminMutation";

/** The Tezkor Advokat request a room belongs to (the live one when there are several). */
export const urgentRecord = (room: Room | undefined): string => (room ? (room.urgentIds.includes(room.activeRecordId) ? room.activeRecordId : (room.urgentIds[room.urgentIds.length - 1] ?? "")) : "");

// POST /urgent-advokat/requests/{id}/chat/complete {summary}: only the advocate / operator may close it (a client gets 403).
export function useCompleteChat(roomId: string, room: Room | undefined, onDone: () => void) {
  const qc = useQueryClient();
  return useAdminMutation<string, string>({
    mutationFn: (summary) => completeUrgentChat(urgentRecord(room), summary.trim()),
    success: "ms2.completed",
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: chatKeys.rooms });
      void qc.invalidateQueries({ queryKey: chatKeys.messages(roomId) });
      onDone();
    },
  });
}
