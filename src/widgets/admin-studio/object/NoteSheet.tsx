import type { ReactNode } from "react";
import { Text } from "@/shared/ui";
import { FormInput, useAppForm } from "@/shared/form";
import { useSheetReset } from "@/shared/lib/useSheetReset";
import { FormSheet } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";
import { noteSchema } from "./noteSchema";

type Props = {
  visible: boolean;
  onClose: () => void;
  title: string;
  lead: string;
  extra?: ReactNode;
  noteLabel?: string;
  notePh?: string;
  confirmLabel: string;
  danger?: boolean;
  busy: boolean;
  error: string;
  onConfirm: (note: string) => void;
};

// Confirm sheet with an optional note (publish, roll back, archive): lead text, extra block, error line.
export function NoteSheet({ visible, onClose, title, lead, extra, noteLabel, notePh, confirmLabel, danger, busy, error, onConfirm }: Props) {
  const { t } = useT();
  const f = useAppForm(noteSchema, { note: "" });
  useSheetReset(visible, () => f.reset({ note: "" }));
  const submit = f.handleSubmit((v) => onConfirm(v.note));
  return (
    <FormSheet visible={visible} onClose={onClose} title={title} onSubmit={() => void submit()} submitLabel={confirmLabel} submitting={busy} danger={danger} snaps={[0.6, 0.92]}>
      <Text variant="small" tone="gray">{lead}</Text>
      {extra}
      {noteLabel ? <FormInput control={f.control} name="note" label={`${noteLabel} (${t("adm.optional")})`} placeholder={notePh} multiline maxLength={1000} style={{ minHeight: 80, textAlignVertical: "top" }} /> : null}
      {error ? <Text variant="small" tone="err">{error}</Text> : null}
    </FormSheet>
  );
}
