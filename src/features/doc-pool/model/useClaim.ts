import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "@/shared/api";
import { useT } from "@/shared/i18n";
import { errorHaptic, successHaptic } from "@/shared/lib/haptics";
import { toast } from "@/shared/ui";
import { claimDoc, refreshDocs } from "@/entities/doc-queue";

// "Take work" offered to this advocate (can_claim). Two advocates can press at once: the loser gets a 409 that is
// shown as a friendly message while the list is read again.
export function useClaim(onClaimed?: (id: string) => void) {
  const qc = useQueryClient();
  const { t } = useT();
  return useMutation({
    mutationFn: (id: string) => claimDoc(id),
    onSuccess: (r, id) => {
      successHaptic();
      toast(t("ad2.claimed"), "ok");
      refreshDocs(qc);
      onClaimed?.(r.id || id);
    },
    onError: (e) => {
      errorHaptic();
      const s = e instanceof ApiError ? e.status : 0;
      refreshDocs(qc);
      toast(s === 409 ? t("ad2.taken") : s === 403 ? t("ad2.denied") : s === 404 ? t("ad2.gone") : t("ad2.claimFail"), "err");
    },
  });
}
