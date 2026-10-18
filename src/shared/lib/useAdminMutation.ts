import { useMutation, useQueryClient, type QueryKey } from "@tanstack/react-query";
import { ApiError } from "@/shared/api";
import { useT } from "@/shared/i18n";
import { errorHaptic, successHaptic } from "./haptics";
import { toast } from "@/shared/ui";

type Opts<V, R> = {
  mutationFn: (v: V) => Promise<R>;
  /** Query keys (prefixes) to refetch after success. */
  invalidate?: QueryKey[];
  /** i18n key of the success toast; omit for none. */
  success?: string;
  onSuccess?: (r: R, v: V) => void;
};

// Write call with the shared feedback: success haptic + toast, refetch the
// affected lists, and the server's own message (or a generic one) on failure.
export function useAdminMutation<V = void, R = unknown>({ mutationFn, invalidate = [], success, onSuccess }: Opts<V, R>) {
  const qc = useQueryClient();
  const { t } = useT();
  return useMutation({
    mutationFn,
    onSuccess: (r, v) => {
      successHaptic();
      if (success) toast(t(success), "ok");
      invalidate.forEach((queryKey) => void qc.invalidateQueries({ queryKey }));
      onSuccess?.(r, v);
    },
    onError: (e) => {
      errorHaptic();
      toast(e instanceof ApiError && e.detail ? e.detail : t("adm.actionFailed"), "err");
    },
  });
}
