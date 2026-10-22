import { useQuery } from "@tanstack/react-query";
import { getAdminCall, listAdminCalls, listInvited, type AdminCallFilter } from "../api/historyApi";
import { getCall, listCalls } from "../api/callApi";

export const meetKeys = {
  all: ["call"] as const,
  mine: ["call", "mine"] as const,
  platform: (f: AdminCallFilter) => ["call", "platform", f] as const,
  detail: (id: string) => ["call", "detail", id] as const,
  room: (roomId: string) => ["call", "room", roomId] as const,
};

// `live` = the user socket pushes call.* events; otherwise poll.
export const useInvited = (live: boolean) => useQuery({ queryKey: meetKeys.mine, queryFn: () => listInvited(), refetchInterval: live ? false : 10_000 });
export const useAdminCalls = (f: AdminCallFilter, enabled: boolean) => useQuery({ queryKey: meetKeys.platform(f), queryFn: () => listAdminCalls(f), enabled });
export const useAdminCall = (id: string | null) => useQuery({ queryKey: meetKeys.detail(id ?? ""), queryFn: () => getAdminCall(id ?? ""), enabled: !!id });
// Event driven: the room socket's call.* frames invalidate this key (no timer polling).
export const useRoomCalls = (roomId: string) => useQuery({ queryKey: meetKeys.room(roomId), queryFn: () => listCalls(roomId), staleTime: 30_000 });
/** The call in a room, re-read on demand (used by the call screen: roster, limits, remaining time). */
export const useCallMeta = (roomId: string, callId: string, interval: number | false, enabled = true) =>
  useQuery({ queryKey: [...meetKeys.room(roomId), callId], queryFn: () => getCall(roomId, callId), refetchInterval: interval, enabled });
