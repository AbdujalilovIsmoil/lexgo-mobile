import { Text } from "@/shared/ui";
import { FormInput } from "@/shared/form";
import { ChipBar, Field, FormSheet, SwitchField } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";
import { useSupportLabels } from "@/entities/support";
import { KINDS, useReportProblem } from "../model/useReportProblem";

// Header form for admins and staff: describe a problem and it lands in the support queue as a ticket.
export function ReportProblemSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { t } = useT();
  const labels = useSupportLabels();
  const f = useReportProblem(onClose);
  return (
    <FormSheet visible={visible} onClose={onClose} title={t("rp.title")} subtitle={t("rp.sub")} onSubmit={() => void f.submit()} submitLabel={t("rp.send")} submitting={f.pending}>
      <FormInput control={f.form.control} name="message" label={t("rp.msg")} placeholder={t("rp.ph")} multiline maxLength={4000} style={{ minHeight: 130, textAlignVertical: "top", paddingTop: 12 }} />
      <Field label={t("rp.kind")}>
        <ChipBar value={f.kind} onChange={f.setKind} options={KINDS.map((k) => ({ value: k, label: labels.category(k) }))} />
      </Field>
      <SwitchField label={t("rp.urgent")} hint={t("rp.urgentHint")} value={f.urgent} onChange={f.setUrgent} />
      {f.error ? <Text variant="small" tone="err">{f.error}</Text> : null}
    </FormSheet>
  );
}
