import { FormSheet } from "@/shared/ui/admin";
import { FormInput, useAppForm } from "@/shared/form";
import { useSheetReset } from "@/shared/lib/useSheetReset";
import { useT } from "@/shared/i18n";
import { feedbackSchema } from "./feedbackSchema";

type Props = { visible: boolean; busy: boolean; onClose: () => void; onSubmit: (comment: string) => void };

// "Not useful" → optional comment. A lawyer-moderator reads these on the server side.
export function FeedbackSheet({ visible, busy, onClose, onSubmit }: Props) {
  const { t } = useT();
  const f = useAppForm(feedbackSchema, { comment: "" });
  useSheetReset(visible, () => f.reset({ comment: "" })); // a fresh comment every time the sheet opens
  const submit = f.handleSubmit((v) => onSubmit(v.comment));
  return (
    <FormSheet visible={visible} onClose={onClose} title={t("ax1.fbTitle")} subtitle={t("ax1.fbSub")} onSubmit={() => void submit()} submitLabel={t("ax1.fbSend")} submitting={busy} snaps={[0.55, 0.9]}>
      <FormInput control={f.control} name="comment" label={t("ax1.fbLabel")} placeholder={t("ax1.fbPlaceholder")} multiline maxLength={500} style={{ minHeight: 90, textAlignVertical: "top" }} />
    </FormSheet>
  );
}
