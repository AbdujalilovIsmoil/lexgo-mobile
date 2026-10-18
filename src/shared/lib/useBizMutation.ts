import { useMutation, useQueryClient, type QueryKey } from "@tanstack/react-query";
import { useT } from "@/shared/i18n";
import { toast, useErrorText } from "@/shared/ui";
import { errorHaptic, successHaptic } from "./haptics";

type Opts<V> = { mutationFn: (v: V) => Promise<unknown>; invalidate?: QueryKey[]; success: string; onSuccess?: () => void };

// Like useAdminMutation, but a refusal is shown as the backend's message OR its business code text (ntd.bz.*:
// additional_payment_not_allowed, marketplace_result_required, package_not_available_for_seller …), never a generic one.
export function useBizMutation<V = void>({ mutationFn, invalidate = [], success, onSuccess }: Opts<V>) {
  const qc = useQueryClient();
  const { t } = useT();
  const text = useErrorText();
  return useMutation({
    mutationFn,
    onSuccess: () => {
      successHaptic();
      toast(t(success), "ok");
      invalidate.forEach((queryKey) => void qc.invalidateQueries({ queryKey }));
      onSuccess?.();
    },
    onError: (e) => {
      errorHaptic();
      toast(e instanceof Error && e.message.startsWith("ntd.bz.") ? t(e.message) : text(e), "err");
    },
  });
}
