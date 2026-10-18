import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "@/shared/api";
import { useT } from "@/shared/i18n";
import { errorHaptic, successHaptic } from "@/shared/lib/haptics";
import { toast } from "@/shared/ui";
import { refreshDocs, transferDoc, type TransferInput } from "@/entities/doc-queue";

// Hand a claimed request to another advocate. Never queued offline (TZ 38): a failure is shown, not retried.
export function useTransfer(onDone?: () => void) {
  const qc = useQueryClient();
  const { t } = useT();
  return useMutation({
    mutationFn: (v: TransferInput) => transferDoc(v),
    onSuccess: () => {
      successHaptic();
      toast(t("ad2.transferred"), "ok");
      refreshDocs(qc);
      onDone?.();
    },
    onError: (e) => {
      errorHaptic();
      const s = e instanceof ApiError ? e.status : 0;
      toast(s === 403 ? t("ad2.transferDenied") : e instanceof ApiError && e.detail ? e.detail : t("ad2.transferFail"), "err");
    },
  });
}
