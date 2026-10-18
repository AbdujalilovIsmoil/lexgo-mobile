import { FormSheet } from "@/shared/ui/admin";
import { FormInput, useAppForm } from "@/shared/form";
import { useSheetReset } from "@/shared/lib/useSheetReset";
import { useT } from "@/shared/i18n";
import { saveMetaSchema } from "./noteSchema";

type Props = { visible: boolean; onClose: () => void; suggest: string; busy: boolean; onSave: (meta: { summary?: string; version?: string }) => void };

// "Save with a note": what changed + an optional version number (empty = the server numbers it).
export function SaveMetaSheet({ visible, onClose, suggest, busy, onSave }: Props) {
  const { t } = useT();
  const f = useAppForm(saveMetaSchema, { summary: "", version: "" });
  useSheetReset(visible, () => f.reset({ summary: "", version: "" }));
  const submit = f.handleSubmit((v) => onSave({ summary: v.summary || undefined, version: v.version.trim() || undefined }));
  return (
    <FormSheet visible={visible} onClose={onClose} title={t("admStudioB.save.more")} onSubmit={() => void submit()} submitLabel={t("adm.save")} submitting={busy} snaps={[0.55, 0.9]}>
      <FormInput control={f.control} name="summary" label={`${t("admStudioB.save.summary")} (${t("adm.optional")})`} placeholder={t("admStudioB.save.summaryPh")} maxLength={300} />
      <FormInput control={f.control} name="version" label={`${t("admStudioB.save.version")} (${t("adm.optional")})`} format={(v) => v.replace(/,/g, ".").replace(/[^\d.]/g, "")} placeholder={suggest} keyboardType="decimal-pad" maxLength={14} hint={t("admStudioB.save.versionHint")} />
    </FormSheet>
  );
}
