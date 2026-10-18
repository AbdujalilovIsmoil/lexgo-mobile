import { useRouter } from "expo-router";
import { chatHref, useUrgentMeeting, type UrgentRequest } from "@/entities/admin-callcenter";
import { useSheetNavigate } from "@/shared/lib/useSheetNavigate";

// Jump into the request's secure chat, or create its 30-minute LiveKit meeting and join it from the chat route
// (`/chat/<roomId>?join=<callId>`). From inside a sheet pass `close`: the sheet must be gone before the route changes.
export function useUrgentNav(close?: () => void) {
  const router = useRouter();
  const meeting = useUrgentMeeting();
  const go = useSheetNavigate(close ?? (() => undefined));
  const run = (fn: () => void) => (close ? go(fn) : fn());
  const openChat = (r: UrgentRequest) => {
    if (r.roomId) run(() => router.push(chatHref(r.roomId, { ua: r.id, wid: r.workId })));
  };
  const startMeeting = (r: UrgentRequest) =>
    meeting.mutate(r.id, { onSuccess: (m) => run(() => router.push(chatHref(m.roomId || r.roomId, { join: m.callId, ua: r.id, wid: r.workId }))) });
  return { openChat, startMeeting, meetingId: meeting.isPending ? meeting.variables : "" };
}
