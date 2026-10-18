import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fileComplaint, ratingKeys, type ComplaintItem, type NewComplaint } from "@/entities/rating";
import { usePaymentError } from "@/entities/payment";
import { contactBlocked } from "@/entities/support";
import { successHaptic } from "@/shared/lib/haptics";

// POST /complaints — a separate business object from the rating; it lands in the call-centre queue.
// A refused contact detail is shown inside the form, so it is not toasted.
export function useFileComplaint(onDone: (c: ComplaintItem) => void) {
  const qc = useQueryClient();
  const fail = usePaymentError();
  return useMutation({
    mutationFn: (v: NewComplaint) => fileComplaint(v),
    onSuccess: (c) => {
      successHaptic();
      void qc.invalidateQueries({ queryKey: ratingKeys.complaints });
      onDone(c);
    },
    onError: (e) => { if (!contactBlocked(e)) fail(e); },
  });
}
