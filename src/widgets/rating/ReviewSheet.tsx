import { useMutation, useQueryClient } from "@tanstack/react-query";
import { reviewTargetOf, StarInput, submitRating, type PendingReview } from "@/entities/rating";
import { usePaymentError } from "@/entities/payment";
import { contactBlocked } from "@/entities/support";
import { FormSheet } from "@/shared/ui/admin";
import { Text, toast } from "@/shared/ui";
import { FormInput, useAppForm, useFieldError } from "@/shared/form";
import { useSheetReset } from "@/shared/lib/useSheetReset";
import { useKept } from "@/shared/lib";
import { successHaptic } from "@/shared/lib/haptics";
import { useT } from "@/shared/i18n";
import { reviewSchema } from "./reviewSchema";

// Rate a finished marketplace job that has no 15-minute window (POST /reviews, moderated).
export function ReviewSheet({ item, onClose }: { item: PendingReview | null; onClose: () => void }) {
  const { t } = useT();
  const qc = useQueryClient();
  const fail = usePaymentError();
  const kept = useKept(item);
  const tr = useFieldError();
  const f = useAppForm(reviewSchema, { stars: 0, comment: "" });
  const stars = f.watch("stars");
  useSheetReset(!!item, () => f.reset({ stars: 0, comment: "" }));
  const p = item ?? kept;
  const m = useMutation({
    mutationFn: (v: { stars: number; comment: string }) => submitRating(reviewTargetOf(p as PendingReview), v.stars, v.comment, ""),
    onSuccess: () => {
      successHaptic();
      toast(t("pwr.rv.thanks"), "ok");
      void qc.invalidateQueries({ queryKey: ["rate-pending"] });
      void qc.invalidateQueries({ queryKey: ["rate-reviews"] });
      onClose();
    },
    onError: (e) => (contactBlocked(e) ? toast(t("pwc.contactBlocked"), "err") : fail(e)),
  });
  const submit = f.handleSubmit((v) => m.mutate(v));
  return (
    <FormSheet visible={!!item} onClose={onClose} title={t("pwr.rv.modalTitle")} subtitle={[p?.lawyerName, p?.title].filter(Boolean).join(" · ")} submitLabel={t("py10.rate.submit")} submitting={m.isPending} onSubmit={() => void submit()}>
      <Text variant="small" tone="gray">{t("pwr.rv.ratingLabel")}</Text>
      <StarInput value={stars} onChange={(n) => f.setValue("stars", n, { shouldValidate: true })} disabled={m.isPending} />
      <Text variant="small" tone={f.formState.errors.stars ? "err" : "gray"} center>{f.formState.errors.stars ? tr(f.formState.errors.stars.message) : stars ? t(`py10.rate.w${stars}`) : t("py10.rate.pick")}</Text>
      <FormInput control={f.control} name="comment" label={t("pwr.rv.commentLabel")} placeholder={t("pwr.rv.commentPh")} maxLength={500} multiline numberOfLines={3} style={{ minHeight: 80, textAlignVertical: "top" }} />
    </FormSheet>
  );
}
