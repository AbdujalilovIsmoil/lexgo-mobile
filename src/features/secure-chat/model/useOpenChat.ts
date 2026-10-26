import { useRouter } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { chatKeys, createRoom, openPrivateChat, type Room } from "@/entities/secure-chat";
import { chatPath } from "@/entities/call";
import { useAccess } from "@/entities/access";
import { useSession } from "@/entities/session";
import { useAdminMutation } from "@/shared/lib/useAdminMutation";

// Opens (or creates) the secure chat with a person and goes into it. Staff and professionals create the room
// themselves (POST /secure-chats); a client opens the private chat with a professional, which the backend
// charges for: 402 comes back with the server's own sentence and the sheet offers the plans.
export function useOpenChat(onDone?: () => void) {
  const router = useRouter();
  const qc = useQueryClient();
  const me = useSession()?.user.id ?? "";
  const a = useAccess();
  const free = a.seller || a.canCalls;
  return useAdminMutation<string, Room>({
    mutationFn: (personId) => (free ? (a.seller ? createRoom(personId, me) : createRoom(me, personId)) : openPrivateChat(personId)),
    onSuccess: (room) => {
      void qc.invalidateQueries({ queryKey: chatKeys.rooms });
      onDone?.();
      router.push(chatPath(room.id) as never);
    },
  });
}
