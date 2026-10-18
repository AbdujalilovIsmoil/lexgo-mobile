import { normReply, useInstructorSession } from "@/entities/instructor";
import { asDict, asStr } from "@/shared/lib/json";
import { useUserEvents } from "@/shared/realtime";
import { deliver } from "./deliver";

// The backend can push an answer for the open session on the user socket (ai_instructor.response); it is
// shown and executed exactly like an HTTP answer (deliver() de-duplicates by response id).
export function useInstructorRealtime(enabled: boolean): void {
  useUserEvents("ai_instructor.response", (e) => {
    const d = asDict(e);
    const reply = normReply(d.response ?? d.data ?? d.payload ?? d, asStr(d.session_id));
    const sid = useInstructorSession.getState().sessionId;
    if (enabled && sid && reply.sessionId === sid && reply.answer) deliver(reply, "");
  });
}
