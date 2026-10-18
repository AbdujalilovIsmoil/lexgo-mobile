import { FormInput, useAppForm } from "@/shared/form";
import { FormSheet } from "@/shared/ui/admin";
import { useSheetReset } from "@/shared/lib/useSheetReset";
import { useT } from "@/shared/i18n";
import { nameSchema } from "../model/fileSchemas";

type Props = { visible: boolean; onClose: () => void; title: string; label: string; initial: string; submitting: boolean; onSubmit: (name: string) => void };

// One-field sheet: new folder name, or renaming a file / folder.
export function NameSheet({ visible, onClose, title, label, initial, submitting, onSubmit }: Props) {
  const { t } = useT();
  const f = useAppForm(nameSchema, { name: initial });
  useSheetReset(visible, () => f.reset({ name: initial }));
  const submit = f.handleSubmit((v) => onSubmit(v.name));
  return (
    <FormSheet visible={visible} onClose={onClose} title={title} snaps={[0.42, 0.7]} onSubmit={() => void submit()} submitLabel={t("adm.save")} submitting={submitting} disabled={f.watch("name").trim() === initial}>
      <FormInput control={f.control} name="name" label={label} autoFocus maxLength={180} returnKeyType="done" onSubmitEditing={() => void submit()} />
    </FormSheet>
  );
}
