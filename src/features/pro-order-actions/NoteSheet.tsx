import { FormInput, useAppForm } from "@/shared/form";
import { FormSheet } from "@/shared/ui/admin";
import { useSheetReset } from "@/shared/lib/useSheetReset";
import { useT } from "@/shared/i18n";
import { noteSchema } from "./noteSchema";

type Props = { visible: boolean; onClose: () => void; title: string; text: string; submitLabel: string; submitting: boolean; onSubmit: (note: string) => void };

// A confirmation with an optional note for the client ("work started", "result delivered", "completed").
export function NoteSheet({ visible, onClose, title, text, submitLabel, submitting, onSubmit }: Props) {
  const { t } = useT();
  const f = useAppForm(noteSchema, { note: "" });
  useSheetReset(visible, () => f.reset({ note: "" }));
  const submit = f.handleSubmit((v) => onSubmit(v.note));
  return (
    <FormSheet visible={visible} onClose={onClose} title={title} subtitle={text} onSubmit={() => void submit()} submitLabel={submitLabel} submitting={submitting} snaps={[0.5, 0.8]}>
      <FormInput control={f.control} name="note" label={t("sl9.noteLabel")} multiline maxLength={500} placeholder={t("sl9.notePh")} />
    </FormSheet>
  );
}
