import { useCompleteChat, type UrgentRequest } from "@/entities/urgent";
import { FormSheet } from "@/shared/ui/admin";
import { Text, confirmDialog } from "@/shared/ui";
import { FormInput, useAppForm } from "@/shared/form";
import { useSheetReset } from "@/shared/lib/useSheetReset";
import { useT } from "@/shared/i18n";
import { chatCompleteSchema } from "./completeSchema";

type Props = { req: UrgentRequest; visible: boolean; onClose: () => void };

// Finish a group chat: the request completes, the room closes (further messages are refused) and the client's rating window opens.
// Only an advocate of the panel or an operator may do it — the client never can (the server answers 403).
export function ChatCompleteSheet({ req, visible, onClose }: Props) {
  const { t } = useT();
  const f = useAppForm(chatCompleteSchema, { summary: "" });
  const m = useCompleteChat();
  useSheetReset(visible, () => f.reset({ summary: "" }));
  const submit = f.handleSubmit((v) =>
    confirmDialog({
      title: t("ug8.chatEnd"), message: t("ug8.chatEndAsk"), confirmLabel: t("ug8.chatEndSubmit"), cancelLabel: t("adm.cancel"), icon: "check-circle", danger: true,
      onConfirm: async () => { await m.mutateAsync({ id: req.id, summary: v.summary }); onClose(); },
    }));
  return (
    <FormSheet visible={visible} onClose={onClose} title={t("ug8.chatEnd")} onSubmit={() => void submit()} submitLabel={t("ug8.chatEndSubmit")} submitting={m.isPending} snaps={[0.5, 0.8]}>
      <Text variant="small" tone="gray">{t("ug8.chatEndLead")}</Text>
      <FormInput control={f.control} name="summary" label={t("ug8.summary")} placeholder={t("ug8.chatSummaryPh")} multiline style={{ minHeight: 90 }} />
    </FormSheet>
  );
}
