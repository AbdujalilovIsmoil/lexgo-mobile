import { FormInput, useAppForm } from "@/shared/form";
import { useSheetReset } from "@/shared/lib/useSheetReset";
import { Text } from "@/shared/ui";
import { FormSheet } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";
import { noteSchema } from "../model/noteSchema";

type Props = { visible: boolean; onClose: () => void; title: string; lead: string; label: string; placeholder: string; confirm: string; danger?: boolean; busy: boolean; onSubmit: (note: string) => void };

// A confirmation drawer with one optional note: what will happen, a text box, a clear button.
// The note starts empty each time the drawer opens.
export function NoteSheet({ visible, onClose, title, lead, label, placeholder, confirm, danger, busy, onSubmit }: Props) {
  const { t } = useT();
  const f = useAppForm(noteSchema, { note: "" });
  useSheetReset(visible, () => f.reset({ note: "" }));
  const submit = f.handleSubmit((v) => onSubmit(v.note));
  return (
    <FormSheet visible={visible} onClose={busy ? () => undefined : onClose} title={title} onSubmit={() => void submit()} submitLabel={confirm} submitting={busy} danger={danger} secondary={{ label: t("mk5.keep"), onPress: onClose }} snaps={[0.62, 0.9]}>
      <Text variant="small" tone="gray">{lead}</Text>
      <FormInput control={f.control} name="note" label={label} placeholder={placeholder} multiline numberOfLines={3} maxLength={500} style={{ minHeight: 80, textAlignVertical: "top" }} />
    </FormSheet>
  );
}
