import { useMutation } from "@tanstack/react-query";
import { setAutoRenew, useAutoRenewStore } from "@/entities/plan";
import { usePaymentError } from "@/entities/payment";
import { useT } from "@/shared/i18n";
import { successHaptic } from "@/shared/lib/haptics";
import { toast } from "@/shared/ui";

const DEVICE_KEY = "device";

// PATCH /subscriptions/{id}/auto-renew. The answer is remembered per subscription (no GET exists).
// Without a subscription (empty id) the choice is kept on this device only, like the web's local flag.
export function useAutoRenew(id: string) {
  const subscriptionId = id || DEVICE_KEY;
  const { t } = useT();
  const fail = usePaymentError();
  const remember = useAutoRenewStore((s) => s.remember);
  const value = useAutoRenewStore((s) => s.flags[subscriptionId]);
  const m = useMutation({
    mutationFn: ({ on, methodId }: { on: boolean; methodId?: string }) => id ? setAutoRenew(id, on, methodId) : Promise.resolve(on),
    onSuccess: (on) => {
      successHaptic();
      remember(subscriptionId, on);
      toast(t(id ? (on ? "py3.auto.on" : "py3.auto.off") : "tgp.saved"), "ok");
    },
    onError: fail,
  });
  return { known: value !== undefined, value: value ?? false, pending: m.isPending, set: (on: boolean, methodId?: string) => m.mutate({ on, methodId }) };
}
