import type { Room } from "livekit-client";
import { endCall, freeExtend, inviteParticipant, leaveCall, patchParticipant, pauseCall, requestPaidExtension, resumeCall, type Call } from "@/entities/call";
import { useAdminMutation } from "@/shared/lib/useAdminMutation";

type Signal = (e: "call.join" | "call.leave" | "call.end") => void;
type Ctx = { roomId: string; callId: string; call: Call | null; room: Room | null; signal: Signal; refetch: () => void; leave: () => void };

// Everything a person can DO in the call besides media: leave / end for all, invite, mute / remove
// somebody (host), hold / resume and extend the meeting (host).
export function useCallActions({ roomId, callId, call, room, signal, refetch, leave }: Ctx) {
  const useM = <V,>(fn: (v: V) => Promise<unknown>, success?: string) => useAdminMutation<V, unknown>({ mutationFn: fn, success, onSuccess: refetch });
  const mute = useM((v: { id: string; mute: boolean }) => patchParticipant(roomId, callId, v.id, { mic_enabled: !v.mute }));
  const kick = useM((id: string) => patchParticipant(roomId, callId, id, { status: "removed" }), "admMeet.removedToast");
  const invite = useM(async (ids: string[]) => { for (const id of ids) await inviteParticipant(roomId, callId, id); }, "admMeet.invitedToast");
  const pause = useM(() => (call?.paused ? resumeCall(roomId, callId) : pauseCall(roomId, callId)), call?.paused ? "admMeet.resumedToast" : "admMeet.pausedToast");
  const free = useM(() => freeExtend(roomId, callId, call?.freeMax || 3), "admMeet.extendedToast");
  const paid = useM((minutes: number) => requestPaidExtension(roomId, callId, minutes), "admMeet.paidAskedToast");
  const close = async (all: boolean) => {
    signal(all ? "call.end" : "call.leave");
    await (all ? endCall(roomId, callId) : leaveCall(roomId, callId)).catch(() => undefined);
    void room?.disconnect();
    leave();
  };
  return { mute, kick, invite, pause, free, paid, leaveCall: () => close(false), endAll: () => close(true) };
}
