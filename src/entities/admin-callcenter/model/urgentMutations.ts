import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "@/shared/api";
import { useT } from "@/shared/i18n";
import { errorHaptic, successHaptic } from "@/shared/lib/haptics";
import { useAdminMutation } from "@/shared/lib/useAdminMutation";
import { toast } from "@/shared/ui";
import { assignGroup, cancelUrgent, claimUrgent, completeUrgent, createUrgentMeeting, setUrgentStatus, transferUrgent } from "../api/urgentApi";
import { assignRefusal } from "./assignRefusal";
import { ccKeys } from "./keys";

const inv = [ccKeys.urgent, ccKeys.queue];

export const useClaimUrgent = () => useAdminMutation({ mutationFn: claimUrgent, invalidate: inv, success: "admCc.uClaimed" });
export const useCompleteUrgent = () => useAdminMutation({ mutationFn: completeUrgent, invalidate: inv, success: "admCcB.uCompleted" });
export const useCancelUrgent = () => useAdminMutation({ mutationFn: cancelUrgent, invalidate: inv, success: "admCcB.uCancelled" });
export const useTransferUrgent = () => useAdminMutation({ mutationFn: transferUrgent, invalidate: inv, success: "admCcB.uTransferred" });
export const useUrgentStatus = () => useAdminMutation({ mutationFn: setUrgentStatus, invalidate: inv, success: "admCcB.uMoved" });
export const useUrgentMeeting = () => useAdminMutation({ mutationFn: createUrgentMeeting, invalidate: inv, success: "admCc.uMeeting" });

// Group assignment keeps its own error handling: a refused panel size / direction is explained inline
// (with the matching override), so only unexpected failures become a toast.
export function useAssignGroup() {
  const qc = useQueryClient();
  const { t } = useT();
  return useMutation({
    mutationFn: assignGroup,
    onSuccess: (_r, v) => {
      successHaptic();
      toast(t("admCcB.groupDone", { n: v.input.lawyerUserIds.length }), "ok");
      inv.forEach((queryKey) => void qc.invalidateQueries({ queryKey }));
    },
    onError: (e) => {
      errorHaptic();
      if (!assignRefusal(e)) toast(e instanceof ApiError && e.detail ? e.detail : t("adm.actionFailed"), "err");
    },
  });
}
