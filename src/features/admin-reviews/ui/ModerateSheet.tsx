import { useModerate, Stars, type Review } from "@/entities/admin-reviews";
import { FactRows, FormSheet } from "@/shared/ui/admin";
import { FormInput, useAppForm } from "@/shared/form";
import { useKept } from "@/shared/lib/useKept";
import { useT } from "@/shared/i18n";
import { moderateSchema } from "./moderateSchema";

export type ModerateTarget = { review: Review; status: "approved" | "rejected" };

// Approve or reject a pending review, with an optional note for the audit trail.
export function ModerateSheet({ target, onClose }: { target: ModerateTarget | null; onClose: () => void }) {
  const { t } = useT();
  const kept = useKept(target);
  const f = useAppForm(moderateSchema, { note: "" });
  const moderate = useModerate();
  const reject = kept?.status === "rejected";
  const close = () => { f.reset(); onClose(); };
  const submit = f.handleSubmit((v) => { if (kept) moderate.mutate({ id: kept.review.id, status: kept.status, note: v.note }, { onSuccess: close }); });
  return (
    <FormSheet visible={!!target} onClose={close} title={reject ? t("admRev.rejectTitle") : t("admRev.approveTitle")} subtitle={kept?.review.lawyerName} onSubmit={() => void submit()} submitLabel={reject ? t("admRev.reject") : t("admRev.approve")} danger={reject} submitting={moderate.isPending} snaps={[0.62, 0.9]}>
      {kept ? <FactRows rows={[{ label: t("admRevB.rating"), value: <Stars n={kept.review.rating} /> }, { label: t("admRevB.comment"), value: kept.review.comment }]} /> : null}
      <FormInput control={f.control} name="note" label={t("admRev.noteLabel")} placeholder={t("admRev.notePh")} multiline />
    </FormSheet>
  );
}
