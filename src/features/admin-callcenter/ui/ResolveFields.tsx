import { FormInput } from "@/shared/form";
import { Text } from "@/shared/ui";
import { SelectField } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";
import type { ComplaintAction } from "@/entities/admin-callcenter";
import type { ResolveForm } from "../model/useResolveForm";

// Ruling + the note the client will read. The hint says what the chosen ruling does before it is done.
export function ResolveFields({ f }: { f: ResolveForm }) {
  const { t } = useT();
  return (
    <>
      <SelectField label={t("admCcB.resolveTitle")} value={f.action} onChange={(v) => f.setAction(v as ComplaintAction)} options={f.actions.map((a) => ({ value: a, label: t(`admCcB.cAct.${a}`) }))} />
      <Text variant="caption" tone="gray">{t(`admCcB.cHint.${f.action}`)}</Text>
      <FormInput control={f.form.control} name="note" label={t("adm.note")} placeholder={t("admCcB.cNotePh")} multiline maxLength={2000} style={{ minHeight: 80 }} />
    </>
  );
}
