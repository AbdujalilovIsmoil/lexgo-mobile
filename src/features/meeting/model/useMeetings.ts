import { useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { isLive, meetKeys, useInvited, type Invited } from "@/entities/call";
import { useSocketState, useUserEvents } from "@/shared/realtime";

const PAST_SHOWN = 50;
const start = (m: Invited) => Date.parse(m.startedAt) || 0;

// Meetings I hosted or was invited to (GET /calls/invited), split into upcoming / running and past. The list refreshes
// on call.* user events (polling only while the socket is down) and after every reconnect.
export function useMeetings() {
  const qc = useQueryClient();
  const q = useInvited(useSocketState() === "online");
  useUserEvents(["call.", "document_request.meeting_created", "urgent_advokat.meeting_created", "urgent_advokat.transferred"], () => void qc.invalidateQueries({ queryKey: meetKeys.mine }));
  const { upcoming, past } = useMemo(() => {
    const all = q.data ?? [];
    return { upcoming: all.filter((m) => isLive(m.callStatus)).sort((a, b) => start(a) - start(b)), past: all.filter((m) => !isLive(m.callStatus)).sort((a, b) => start(b) - start(a)).slice(0, PAST_SHOWN) };
  }, [q.data]);
  return { q, upcoming, past };
}
