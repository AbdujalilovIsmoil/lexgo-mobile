import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "@/shared/api";
import { useT } from "@/shared/i18n";
import { errorHaptic, successHaptic } from "@/shared/lib/haptics";
import { useAdminMutation } from "@/shared/lib/useAdminMutation";
import { toast } from "@/shared/ui";
import { claimTicket, closeTicket, reopenTicket, startCall, transferTicket } from "../api/ticketApi";
import { supKeys } from "./keys";
import type { CallKind } from "./types";

// Claim: a 409 means another operator was faster — say so in our own words and refresh.
export function useClaim() {
  const qc = useQueryClient();
  const { t } = useT();
  return useMutation({
    mutationFn: (id: string) => claimTicket(id),
    onSuccess: () => {
      successHaptic();
      toast(t("admSup.claimedOk"), "ok");
      void qc.invalidateQueries({ queryKey: supKeys.all });
    },
    onError: (e) => {
      errorHaptic();
      toast(e instanceof ApiError && e.status === 409 ? t("admSup.claimTaken") : e instanceof ApiError && e.detail ? e.detail : t("adm.actionFailed"), "err");
      void qc.invalidateQueries({ queryKey: supKeys.all });
    },
  });
}

const inv = [supKeys.all];
export const useTransfer = (onSuccess?: () => void) =>
  useAdminMutation({ mutationFn: (v: { id: string; operatorId: string; reason: string }) => transferTicket(v.id, v.operatorId, v.reason), invalidate: inv, success: "admSup.transferOk", onSuccess });
export const useClose = (onSuccess?: () => void) =>
  useAdminMutation({ mutationFn: (v: { id: string; resolution: string }) => closeTicket(v.id, v.resolution), invalidate: inv, success: "admSup.closedOk", onSuccess });
export const useReopen = (onSuccess?: () => void) =>
  useAdminMutation({ mutationFn: (v: { id: string; reason: string }) => reopenTicket(v.id, v.reason), invalidate: inv, success: "admSup.reopenedOk", onSuccess });
export const useStartCall = () => useAdminMutation({ mutationFn: (v: { id: string; kind: CallKind; title: string }) => startCall(v.id, v.kind, v.title) });
