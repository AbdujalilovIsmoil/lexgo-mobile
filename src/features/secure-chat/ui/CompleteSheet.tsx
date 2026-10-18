import { FormSheet } from "@/shared/ui/admin";
import { Text } from "@/shared/ui";
import { FormInput, useAppForm } from "@/shared/form";
import { useT } from "@/shared/i18n";
import type { useCompleteChat } from "../model/useCompleteChat";
import { summarySchema } from "./chatSchemas";

// Closing a Tezkor Advokat chat: the summary is what the client and the next advocate read afterwards (max 2000).
export function CompleteSheet({ visible, onClose, action }: { visible: boolean; onClose: () => void; action: ReturnType<typeof useCompleteChat> }) {
  const { t } = useT();
  const f = useAppForm(summarySchema, { summary: "" });
  const submit = f.handleSubmit(async (v) => {
    try {
      await action.mutateAsync(v.summary);
      f.reset({ summary: "" });
      onClose();
    } catch { /* the mutation already toasted the server message */ }
  });
  return (
    <FormSheet visible={visible} onClose={onClose} title={t("ms2.complete")} subtitle={t("ms2.completeText")} onSubmit={() => void submit()} submitLabel={t("ms2.completeSubmit")} submitting={action.isPending} snaps={[0.62, 0.9]}>
      <FormInput control={f.control} name="summary" label={t("ms2.summary")} placeholder={t("ms2.summaryPh")} maxLength={2000} multiline numberOfLines={5} style={{ minHeight: 110, textAlignVertical: "top" }} />
      <Text variant="caption" tone="gray">{t("ms2.completeNote")}</Text>
    </FormSheet>
  );
}
