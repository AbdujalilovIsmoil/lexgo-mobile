import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createGift, giftsKey, type GiftCreated, type GiftInput } from "@/entities/profile-extras";
import { isProviderDown, payKeys, PROVIDER_LADDER, usePaymentError } from "@/entities/payment";
import { successHaptic } from "@/shared/lib/haptics";

// POST /gifts creates the gift and its payment. A provider that is not connected is skipped for
// the next one (payme/click 503 on staging); the payment's own status is the backend's word.
export function useCreateGift(onCreated: (g: GiftCreated) => void) {
  const qc = useQueryClient();
  const fail = usePaymentError();
  return useMutation({
    mutationFn: async (i: GiftInput): Promise<GiftCreated> => {
      let last: unknown;
      for (const provider of PROVIDER_LADDER) {
        try {
          return await createGift(i, provider);
        } catch (e) {
          last = e;
          if (!isProviderDown(e)) throw e;
        }
      }
      throw last;
    },
    onSuccess: (g) => {
      successHaptic();
      void qc.invalidateQueries({ queryKey: giftsKey });
      void qc.invalidateQueries({ queryKey: payKeys.list });
      onCreated(g);
    },
    onError: fail,
  });
}
