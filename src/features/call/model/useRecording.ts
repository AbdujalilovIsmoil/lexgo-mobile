import { answerRecording, requestRecording, startRecording, type Call } from "@/entities/call";
import { useSession } from "@/entities/session";
import { useAdminMutation } from "@/shared/lib/useAdminMutation";

// Recording consent (TZ 24.2): the client asks, the host allows, only then it starts — the server refuses to start
// without the host's yes (403 "Host recordingga ruxsat bermagan"). Everything is call state; there is no stop endpoint.
// The device itself captures nothing: `recording/start` registers who records and tells the room.
export function useRecording(roomId: string, callId: string, call: Call | null, refetch: () => void) {
  const myId = useSession()?.user.id ?? "";
  const state = call?.recording.state ?? "off";
  const host = !!call?.perms.canEnd;
  const useM = <V,>(fn: (v: V) => Promise<unknown>, success?: string) => useAdminMutation<V, unknown>({ mutationFn: fn, success, onSuccess: refetch });
  const request = useM(() => requestRecording(roomId, callId), "ms6.recAsked");
  const answer = useM((ok: boolean) => answerRecording(roomId, callId, ok));
  const start = useM(async () => {
    if (state !== "allowed") await answerRecording(roomId, callId, true);
    await startRecording(roomId, callId);
  }, "ms6.recStarted");
  return {
    state,
    host,
    byMe: call?.recording.requestedBy === myId,
    canAsk: !host && (state === "off" || state === "denied"),
    canStart: host && (state === "off" || state === "allowed"),
    who: call?.participants.find((p) => p.userId === (state === "recording" ? call.recording.startedBy : call.recording.requestedBy))?.name ?? "",
    request,
    answer,
    start,
  };
}
export type Recording = ReturnType<typeof useRecording>;
