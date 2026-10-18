import { useQuery } from "@tanstack/react-query";
import { chatKeys, getRoom, isClosed, type Msg, type Room } from "@/entities/secure-chat";
import { useSocketState } from "@/shared/realtime";
import { useSession } from "@/entities/session";
import { useRooms } from "@/entities/secure-chat";
import { urgentRecord } from "./useCompleteChat";

// The room from the cached list (instant), or fetched on its own when the list does not hold it yet
// (a deep link from a push, a room that was just created).
export function useRoom(roomId: string) {
  const myId = useSession()?.user.id ?? "";
  const list = useRooms(useSocketState() === "online", myId);
  const cached = list.data?.find((r) => r.id === roomId);
  const one = useQuery({ queryKey: chatKeys.room(roomId), queryFn: () => getRoom(roomId), enabled: !cached && !list.isLoading });
  return { room: cached ?? one.data, loading: list.isLoading || (!cached && one.isLoading), error: cached ? null : one.error };
}

/** The consultation is over: archived / completed room, or its closing `result` message is in the history. */
export const isFinished = (room: Room | undefined, msgs: Msg[]): boolean => {
  const rec = urgentRecord(room);
  return isClosed(room) || (!!rec && msgs.some((m) => m.type === "result" && m.urgentId === rec));
};
