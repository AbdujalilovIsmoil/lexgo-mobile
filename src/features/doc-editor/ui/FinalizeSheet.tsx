import { FormInput, useAppForm } from "@/shared/form";
import { Text, confirmDialog } from "@/shared/ui";
import { FactRows, FormSheet } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";
import { fmtTime } from "@/shared/lib/format";
import { useSheetReset } from "@/shared/lib/useSheetReset";
import type { DocReq, FinalizeResult } from "@/entities/doc-queue";
import { useFinalize } from "../model/useFinalize";
import { notesSchema } from "../model/notesSchema";
import type { Save } from "../model/useSaveState";

type Props = { doc: DocReq; save: Save; visible: boolean; onClose: () => void; onSent: (r: FinalizeResult) => void };

// "Send to client": summary + optional note; the irreversible step is confirmed in a dialog.
// Disabled while the editor still reports unsaved changes.
export function FinalizeSheet({ doc, save, visible, onClose, onSent }: Props) {
  const { t } = useT();
  const f = useAppForm(notesSchema, { notes: "" });
  useSheetReset(visible, () => f.reset({ notes: "" }));
  const send = useFinalize(doc.id, onSent);
  const saving = save.state === "saving";
  const go = f.handleSubmit((v) => {
    onClose();
    setTimeout(() => confirmDialog({ title: t("ad3.finalize"), message: t("ad3.finalizeAsk"), confirmLabel: t("ad3.finalizeYes"), cancelLabel: t("common.cancel"), icon: "send", onConfirm: async () => { await send.mutateAsync(v.notes || t("ad3.notesDefault")); } }), 320);
  });
  return (
    <FormSheet visible={visible} onClose={onClose} title={t("ad3.finalize")} subtitle={doc.title} onSubmit={() => void go()} submitLabel={t("ad3.finalizeBtn")} disabled={saving} snaps={[0.62, 0.9]}>
      <FactRows rows={[{ label: t("ad1.client"), value: doc.clientName }, { label: t("ad3.saveState"), value: saving ? t("ad3.saving") : save.at ? `${t("ad3.saved")} ${fmtTime(save.at)}` : t("ad3.noChanges") }]} />
      <Text variant="small" tone="gray">{saving ? t("ad3.waitSave") : t("ad3.finalizeLead")}</Text>
      <FormInput control={f.control} name="notes" label={t("ad3.notes")} multiline placeholder={t("ad3.notesDefault")} style={{ minHeight: 70, textAlignVertical: "top" }} />
    </FormSheet>
  );
}
