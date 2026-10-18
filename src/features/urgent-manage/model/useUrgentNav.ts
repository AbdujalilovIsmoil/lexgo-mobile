import { useRouter } from "expo-router";
import { callHref, chatHref, useMeeting, type UrgentRequest } from "@/entities/urgent";

// Jump into the request's secure chat / running call, or create its LiveKit meeting and join it at once.
// The chat and call screens belong to the messaging package; only the routes are used here.
export function useUrgentNav() {
  const router = useRouter();
  const meeting = useMeeting();
  const openChat = (r: UrgentRequest) => r.roomId && router.push(chatHref(r.roomId, { ua: r.id, wid: r.workId }));
  const join = (r: UrgentRequest) => r.roomId && r.callId && router.push(callHref(r.roomId, r.callId));
  const startMeeting = (r: UrgentRequest) => meeting.mutate(r.id, { onSuccess: (m) => router.push(callHref(m.roomId || r.roomId, m.callId)) });
  return { openChat, join, startMeeting, meetingId: meeting.isPending ? meeting.variables : "" };
}
