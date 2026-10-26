import { useQuery } from "@tanstack/react-query";
import { listInvited } from "../api/historyApi";
import { getCall, listCalls } from "../api/callApi";

export const meetKeys = {
  all: ["call"] as const,
  mine: ["call", "mine"] as const,
  room: (roomId: string) => ["call", "room", roomId] as const,
};

// `live` = the user socket pushes call.* events; otherwise poll.
export const useInvited = (live: boolean) => useQuery({ queryKey: meetKeys.mine, queryFn: () => listInvited(), refetchInterval: live ? false : 10_000 });
// Event driven: the room socket's call.* frames invalidate this key (no timer polling).
export const useRoomCalls = (roomId: string) => useQuery({ queryKey: meetKeys.room(roomId), queryFn: () => listCalls(roomId), staleTime: 30_000 });
/** The call in a room, re-read on demand (used by the call screen: roster, limits, remaining time). */
export const useCallMeta = (roomId: string, callId: string, interval: number | false, enabled = true) =>
  useQuery({ queryKey: [...meetKeys.room(roomId), callId], queryFn: () => getCall(roomId, callId), refetchInterval: interval, enabled });
