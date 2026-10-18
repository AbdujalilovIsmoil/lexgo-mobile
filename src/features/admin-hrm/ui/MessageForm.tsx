import { FormSheet, Field } from "@/shared/ui/admin";
import { Icon, PressableScale, Text } from "@/shared/ui";
import { FormInput, useAppForm } from "@/shared/form";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { messageSchema } from "../model/workSchemas";
import { useSendMessage } from "../model/useWorkActions";

export type Recipient = { id: string; name: string };

// Write a direct message: the recipient row opens the people picker (owned by the caller), then the text.
export function MessageForm({ visible, onClose, to, onPick }: { visible: boolean; onClose: () => void; to: Recipient | null; onPick: () => void }) {
  const { t } = useT();
  const c = useColors();
  const f = useAppForm(messageSchema, { subject: "", body: "" });
  const send = useSendMessage();
  const submit = f.handleSubmit((v) => to && send.mutate({ to: to.id, body: v.body, subject: v.subject }, { onSuccess: () => { f.reset(); onClose(); } }));
  return (
    <FormSheet visible={visible} onClose={onClose} title={t("admHrm.newMessage")} onSubmit={() => void submit()} submitLabel={t("admHrm.send")} submitting={send.isPending} disabled={!to}>
      <Field label={t("admHrm.recipient")}>
        <PressableScale onPress={onPick} style={{ flexDirection: "row", alignItems: "center", gap: 10, minHeight: 52, paddingHorizontal: 14, borderRadius: 14, borderWidth: 1.5, borderColor: c.line, backgroundColor: c.surface }}>
          <Icon name="user" size={18} tone="gray" />
          <Text variant="body" tone={to ? "ink" : "gray2"} style={{ flex: 1 }} numberOfLines={1}>{to?.name || t("admHrm.pickRecipient")}</Text>
          <Icon name="chevron-right" size={18} tone="gray" />
        </PressableScale>
      </Field>
      <FormInput control={f.control} name="subject" label={t("admHrmS.subject")} maxLength={160} placeholder={t("admHrmS.subjectPh")} autoCapitalize="sentences" />
      <FormInput control={f.control} name="body" label={t("admHrm.messageBody")} multiline maxLength={4000} autoCapitalize="sentences" style={{ minHeight: 110, textAlignVertical: "top" }} />
    </FormSheet>
  );
}
