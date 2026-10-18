import { useRouter } from "expo-router";
import { callPath, chatPath, endCall, isLive, meetKeys, useCallMeta, useInvited, type Call, type Invited } from "@/entities/call";
import { useSocketState, useUserEvents } from "@/shared/realtime";
import { useAdminMutation } from "@/shared/lib/useAdminMutation";

// One meeting for its page: the invited-list row (host, my status), the live call snapshot (roster, remaining time,
// recording) kept fresh by call.* events, and the host's "end for everybody".
export function useMeeting(callId: string, roomHint: string) {
  const router = useRouter();
  const list = useInvited(useSocketState() === "online");
  const row: Invited | undefined = list.data?.find((m) => m.callId === callId);
  const roomId = roomHint || row?.roomId || "";
  const meta = useCallMeta(roomId, callId, false, !!roomId);
  const refetch = meta.refetch;
  useUserEvents("call.", (e) => { if (!e.call_id || e.call_id === callId) void refetch(); });
  const call: Call | undefined = meta.data;
  const end = useAdminMutation({ mutationFn: () => endCall(roomId, callId), invalidate: [meetKeys.mine], success: "ms7.ended", onSuccess: () => void refetch() });
  const loading = list.isLoading || (!!roomId && meta.isLoading);
  const live = !!call && isLive(call.status);
  const out = row ? ["removed", "declined"].includes(row.status) : false;
  return { row, call, roomId, loading, error: meta.error ?? (list.isError ? list.error : null), live, canJoin: live && !out, end, refetch: () => void refetch(), join: () => router.push(callPath(roomId, callId) as never), chat: () => router.push(chatPath(roomId) as never) };
}
