import { LOST_REASONS } from "@/entities/admin-callcenter";
import { FormSheet, SelectField } from "@/shared/ui/admin";
import { Text } from "@/shared/ui";
import { FormInput, useAppForm } from "@/shared/form";
import { useT } from "@/shared/i18n";
import { ccLostSchema } from "../model/ccSchemas";

type Props = { visible: boolean; onClose: () => void; onConfirm: (reason: string, note: string) => void };

// Asked before a card lands in a "lost" column: the reason feeds the statistics.
export function LostSheet({ visible, onClose, onConfirm }: Props) {
  const { t } = useT();
  const f = useAppForm(ccLostSchema, { reason: "price", note: "" });
  const submit = f.handleSubmit((v) => { onConfirm(v.reason, v.note); f.resetField("note"); });
  return (
    <FormSheet visible={visible} onClose={onClose} title={t("admCcB.lostTitle")} onSubmit={() => void submit()} submitLabel={t("admCcB.lostConfirm")} danger snaps={[0.6, 0.9]}>
      <Text variant="small" tone="gray">{t("admCcB.lostLead")}</Text>
      <SelectField label={t("adm.reason")} value={f.watch("reason")} onChange={(x) => f.setValue("reason", x)} options={LOST_REASONS.map((r) => ({ value: r, label: t(`admCcB.lost.${r}`) }))} />
      <FormInput control={f.control} name="note" label={t("admCcB.lostNote")} multiline style={{ minHeight: 70 }} />
    </FormSheet>
  );
}
