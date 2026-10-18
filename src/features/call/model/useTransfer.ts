import { useQuery } from "@tanstack/react-query";
import { http } from "@/shared/api";
import { getRoom, chatKeys } from "@/entities/secure-chat";
import { pauseCall, resumeCall, type Call } from "@/entities/call";
import { useAccess } from "@/entities/access";
import { useAdminMutation } from "@/shared/lib/useAdminMutation";

export type Work = { kind: "doc" | "urgent"; id: string };

// The work behind a call: a document lawyer-request (call.document_lawyer_record_id) or a Tezkor Advokat request
// (named by the call's room). Only a host of such a call can hand it on.
export function useWork(roomId: string, call: Call | null): Work | null {
  const a = useAccess();
  const room = useQuery({ queryKey: chatKeys.room(roomId), queryFn: () => getRoom(roomId), enabled: !!call?.perms.canEnd && !call.docRecordId, staleTime: 120_000 });
  if (!call?.perms.canEnd) return null;
  if (call.docRecordId) return { kind: "doc", id: call.docRecordId };
  const urgent = room.data?.activeRecordId && room.data.urgentIds.includes(room.data.activeRecordId) ? room.data.activeRecordId : room.data?.urgentIds[0];
  return urgent && (a.callCenter || a.isFullAdmin) ? { kind: "urgent", id: urgent } : null;
}

// Transfer (TZ 24.3): the meeting is put on hold first, then the work goes to the chosen advocate (who gets a realtime
// notification); if the server refuses, the hold is lifted again. Contract-read only: needs an advocate account.
export function useTransfer(roomId: string, callId: string, call: Call | null, work: Work | null, onDone: () => void) {
  return useAdminMutation<{ lawyerId: string; reason: string }, unknown>({
    mutationFn: async ({ lawyerId, reason }) => {
      if (!work) throw new Error("no work");
      const held = !call?.paused;
      if (held) await pauseCall(roomId, callId, 10);
      const path = work.kind === "doc" ? `/lawyers/me/document-requests/${encodeURIComponent(work.id)}/transfer` : `/call-center/urgent-advokat/requests/${encodeURIComponent(work.id)}/transfer`;
      try {
        return await http(path, { method: "POST", body: { target_lawyer_user_id: lawyerId, reason } });
      } catch (e) {
        if (held) await resumeCall(roomId, callId).catch(() => undefined);
        throw e;
      }
    },
    success: "ms6.transferred",
    onSuccess: onDone,
  });
}
