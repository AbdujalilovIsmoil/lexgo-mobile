import { http } from "@/shared/api";
import { pauseCall, resumeCall, type Call } from "@/entities/call";
import { useAdminMutation } from "@/shared/lib/useAdminMutation";

export type Work = { kind: "doc"; id: string };

// The work behind a call that its host may hand on: a document lawyer-request (call.document_lawyer_record_id). A Tezkor Advokat request
// is passed on by the call centre only, which works in the web panel.
export const workOf = (call: Call | null): Work | null => (call?.perms.canEnd && call.docRecordId ? { kind: "doc", id: call.docRecordId } : null);

// Transfer (TZ 24.3): the meeting is put on hold first, then the work goes to the chosen advocate (who gets a realtime
// notification); if the server refuses, the hold is lifted again. Contract-read only: needs an advocate account.
export function useTransfer(roomId: string, callId: string, call: Call | null, work: Work | null, onDone: () => void) {
  return useAdminMutation<{ lawyerId: string; reason: string }, unknown>({
    mutationFn: async ({ lawyerId, reason }) => {
      if (!work) throw new Error("no work");
      const held = !call?.paused;
      if (held) await pauseCall(roomId, callId, 10);
      const path = `/lawyers/me/document-requests/${encodeURIComponent(work.id)}/transfer`;
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
