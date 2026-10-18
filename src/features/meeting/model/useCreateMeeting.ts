import { useRouter } from "expo-router";
import { callPath, createMeetingRoom, meetKeys, startCall, type CallType } from "@/entities/call";
import { useAccess } from "@/entities/access";
import { useSession } from "@/entities/session";
import { useAdminMutation } from "@/shared/lib/useAdminMutation";
import { useT } from "@/shared/i18n";

export const MEETING_MINUTES = [15, 30, 60]; // TZ 24.1: a meeting is 15 minutes by default
export type NewMeeting = { title: string; ids: string[]; type: CallType; minutes: number };

// Start a meeting: a secure-chat room (the meeting lives under it) → a call with everybody invited, limited to the
// chosen minutes → the call screen. Staff take the client side of the room, sellers the seller side.
export function useCreateMeeting(onDone?: () => void) {
  const router = useRouter();
  const { t } = useT();
  const me = useSession()?.user;
  const seller = useAccess().seller;
  return useAdminMutation({
    mutationFn: async ({ title, ids, type, minutes }: NewMeeting) => {
      const roomId = await createMeetingRoom(seller ? ids[0] : me?.id || ids[0], seller ? me?.id ?? "" : ids[0]);
      const call = await startCall(roomId, type, title.trim() || t("admMeet.meeting"), ids, minutes);
      return { roomId, callId: call.id };
    },
    invalidate: [meetKeys.mine],
    onSuccess: ({ roomId, callId }) => {
      onDone?.();
      router.push(callPath(roomId, callId) as never);
    },
  });
}
