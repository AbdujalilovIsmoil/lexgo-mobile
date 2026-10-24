import { useMutation, useQueryClient } from "@tanstack/react-query";
import { flowErrorKey, needsRefetch } from "@/entities/market-flow";
import { useT } from "@/shared/i18n";
import { errorHaptic, successHaptic } from "@/shared/lib/haptics";
import { toast, useErrorText } from "@/shared/ui";

// The order lists and the open order (client and seller), plus its financials / checklist / timeline.
const ORDER_KEYS = [["market-orders"], ["pro-order"], ["mf"], ["market-history"]];

type Opts<V, R> = { mutationFn: (v: V) => Promise<R>; success?: string; onSuccess?: (r: R, v: V) => void; onError?: (e: unknown) => boolean };

// A marketplace order action (TZ §15–16): one request at a time (the caller disables the button while pending), never queued for replay,
// a backend business code explained in words (detail.code first), and after a 409 / known code the order is re-read before anything else is
// offered. `onError` may take over an error (return true) to show it in place instead of a toast.
export function useFlowMutation<V, R = unknown>({ mutationFn, success, onSuccess, onError }: Opts<V, R>) {
  const qc = useQueryClient();
  const { t } = useT();
  const text = useErrorText();
  const refresh = () => ORDER_KEYS.forEach((queryKey) => void qc.invalidateQueries({ queryKey }));
  return useMutation({
    mutationFn,
    networkMode: "always", // offline it fails at once with a retry — never parked and replayed later (TZ §15)
    onSuccess: (r, v) => {
      successHaptic();
      if (success) toast(t(success), "ok");
      refresh();
      onSuccess?.(r, v);
    },
    onError: (e) => {
      errorHaptic();
      if (needsRefetch(e)) refresh();
      if (onError?.(e)) return;
      const key = flowErrorKey(e);
      toast(key ? t(key) : text(e), "err");
    },
  });
}
