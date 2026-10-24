import { useMutation, useQueryClient } from "@tanstack/react-query";
import { isRatingClosed, ratingKeys, submitRating, type QualityComplaintRef, type RateTarget } from "@/entities/rating";
import { usePaymentError } from "@/entities/payment";
import { useT } from "@/shared/i18n";
import { successHaptic } from "@/shared/lib/haptics";
import { toast } from "@/shared/ui";

type Vars = { stars: number; comment: string; complaint: string };

// Sends the rating (and the complaint text a 1–2 star rating carries). A closed window is a state:
// the target is re-read so the screen shows "muddat tugagan", with no error toast.
export function useSubmitRating(target: RateTarget | undefined, onDone: (qc: QualityComplaintRef | null) => void) {
  const { t } = useT();
  const qc = useQueryClient();
  const fail = usePaymentError();
  return useMutation({
    mutationFn: (v: Vars) => submitRating(target as RateTarget, v.stars, v.comment.trim(), v.complaint),
    onSuccess: (c) => {
      successHaptic();
      void qc.invalidateQueries({ queryKey: ["rate-target"] });
      void qc.invalidateQueries({ queryKey: ratingKeys.complaints });
      void qc.invalidateQueries({ queryKey: ratingKeys.open });
      void qc.invalidateQueries({ queryKey: ["rate-reviews"] });
      // TZ §10: a 1–2 star rating opens the complaint on the backend — the order is re-read so its complaint action is not offered twice.
      void qc.invalidateQueries({ queryKey: ["market-orders"] });
      void qc.invalidateQueries({ queryKey: ["mf"] });
      onDone(c);
    },
    onError: (e) => {
      if (isRatingClosed(e)) {
        toast(t("py10.closed.title"), "info");
        void qc.invalidateQueries({ queryKey: ["rate-target"] });
        void qc.invalidateQueries({ queryKey: ["market-orders"] });
        return;
      }
      fail(e);
    },
  });
}
