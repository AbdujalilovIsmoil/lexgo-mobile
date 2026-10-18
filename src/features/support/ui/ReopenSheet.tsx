import { ApiError } from "@/shared/api";
import { FormInput, rules, useAppForm } from "@/shared/form";
import { toast } from "@/shared/ui";
import { FormSheet } from "@/shared/ui/admin";
import { useSheetReset } from "@/shared/lib/useSheetReset";
import { useT } from "@/shared/i18n";
import { useReopenTicket } from "@/entities/support";

type Props = { ticketId: string; visible: boolean; onClose: () => void };

// Reopen a finished chat (POST …/reopen) with an optional note on what is still unsolved.
export function ReopenSheet({ ticketId, visible, onClose }: Props) {
  const { t } = useT();
  const f = useAppForm(rules.note, { reason: "" });
  const reopen = useReopenTicket(ticketId);
  useSheetReset(visible, () => f.reset({ reason: "" }));
  const submit = f.handleSubmit((v) =>
    reopen.mutate(v.reason, {
      onSuccess: () => {
        toast(t("sp3.reopenedOk"), "ok");
        onClose();
      },
      onError: (e) => toast(e instanceof ApiError && e.detail ? e.detail : t("sp3.reopenFailed"), "err"),
    }));
  return (
    <FormSheet visible={visible} onClose={onClose} title={t("sp3.reopen")} subtitle={t("sp3.reopenHint")} onSubmit={() => void submit()} submitLabel={t("sp3.reopenDo")} submitting={reopen.isPending} snaps={[0.6, 0.9]}>
      <FormInput control={f.control} name="reason" label={t("sp3.reopenReason")} placeholder={t("sp3.reopenPh")} multiline maxLength={1000} style={{ minHeight: 90, textAlignVertical: "top" }} />
    </FormSheet>
  );
}
