import { useState } from "react";
import { FormInput, useAppForm } from "@/shared/form";
import { Button, Text } from "@/shared/ui";
import { FormSheet } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";
import { useSheetReset } from "@/shared/lib/useSheetReset";
import type { DocReq, FinalizeResult } from "@/entities/doc-queue";
import type { Docx } from "../lib/pickDocx";
import { notesSchema } from "../model/notesSchema";
import { useFulfill, usePickDocx } from "../model/useFulfill";

type Props = { doc: DocReq; visible: boolean; onClose: () => void; onSent: (r: FinalizeResult) => void };

// Send a finished .docx instead of using the editor (template-backed requests, TZ "upload own file").
export function FulfillSheet({ doc, visible, onClose, onSent }: Props) {
  const { t } = useT();
  const [file, setFile] = useState<Docx | null>(null);
  const f = useAppForm(notesSchema, { notes: "" });
  useSheetReset(visible, () => { setFile(null); f.reset({ notes: "" }); });
  const pick = usePickDocx(setFile);
  const send = useFulfill(doc.id, (r) => { onClose(); onSent(r); });
  const submit = f.handleSubmit((v) => file && send.mutate({ file, notes: v.notes }));
  return (
    <FormSheet visible={visible} onClose={onClose} title={t("ad3.fulfillTitle")} subtitle={doc.title} onSubmit={() => void submit()} submitLabel={t("ad3.finalizeBtn")} submitting={send.isPending} disabled={!file} snaps={[0.62, 0.9]}>
      <Text variant="small" tone="gray">{t("ad3.fulfillLead")}</Text>
      <Button title={file ? file.name : t("ad3.chooseFile")} icon="upload" variant="line" full onPress={() => void pick()} />
      <FormInput control={f.control} name="notes" label={t("ad3.notes")} multiline style={{ minHeight: 70, textAlignVertical: "top" }} />
    </FormSheet>
  );
}
