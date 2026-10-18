import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "@/shared/api";
import { useT } from "@/shared/i18n";
import { errorHaptic, successHaptic } from "@/shared/lib/haptics";
import { toast } from "@/shared/ui";
import { claimDoc, docKeys, refreshDocs, type DocReq } from "@/entities/doc-queue";

// "Take work" from the pool. Two advocates can press at once: the loser gets a 409 that is
// shown as a friendly message while the card disappears and the pool is re-read.
export function useClaim(onClaimed?: (id: string) => void) {
  const qc = useQueryClient();
  const { t } = useT();
  const drop = (id: string) => qc.setQueryData<DocReq[]>(docKeys.pool, (list) => list?.filter((d) => d.id !== id));
  return useMutation({
    mutationFn: (id: string) => claimDoc(id),
    onSuccess: (r, id) => {
      successHaptic();
      toast(t("ad2.claimed"), "ok");
      drop(id);
      refreshDocs(qc);
      onClaimed?.(r.id || id);
    },
    onError: (e, id) => {
      errorHaptic();
      const s = e instanceof ApiError ? e.status : 0;
      if (s === 409 || s === 404) drop(id);
      void qc.invalidateQueries({ queryKey: docKeys.pool });
      toast(s === 409 ? t("ad2.taken") : s === 403 ? t("ad2.denied") : s === 404 ? t("ad2.gone") : t("ad2.claimFail"), "err");
    },
  });
}
