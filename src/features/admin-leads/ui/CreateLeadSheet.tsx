import { FormSheet, SelectField } from "@/shared/ui/admin";
import { FormInput, FormPhoneInput, useAppForm } from "@/shared/form";
import { useT } from "@/shared/i18n";
import { categoryLabel, regionLabel, useCreateLead, type Operator } from "@/entities/admin-leads";
import { LEAD_CATEGORIES as CATEGORIES, LEAD_REGIONS as REGIONS } from "../model/options";
import { createLeadSchema } from "../model/leadSchemas";

const EMPTY = { name: "", phone: "", category: "", region: "", note: "", operatorId: "" };

// New lead (manual source). Without an operator the backend picks the least loaded one.
export function CreateLeadSheet({ visible, onClose, ops }: { visible: boolean; onClose: () => void; ops: Operator[] }) {
  const { t } = useT();
  const f = useAppForm(createLeadSchema, EMPTY);
  const create = useCreateLead();
  const [category, region, operatorId] = f.watch(["category", "region", "operatorId"]);
  const submit = f.handleSubmit((v) => create.mutate(v, { onSuccess: () => { f.reset(); onClose(); } }));
  const none = { value: "", label: t("admLeads.notSet") };
  return (
    <FormSheet visible={visible} onClose={onClose} title={t("admLeads.createTitle")} onSubmit={() => void submit()} submitLabel={t("adm.create")} submitting={create.isPending}>
      <FormInput control={f.control} name="name" label={t("adm.name")} autoCapitalize="words" returnKeyType="next" />
      <FormPhoneInput control={f.control} name="phone" label={t("adm.phone")} />
      <SelectField label={t("admLeads.category")} value={category} options={[none, ...CATEGORIES.map((c) => ({ value: c, label: categoryLabel(t, c) }))]} onChange={(x) => f.setValue("category", x)} />
      <SelectField label={t("admLeads.region")} value={region} options={[none, ...REGIONS.map((r) => ({ value: r, label: regionLabel(t, r) }))]} onChange={(x) => f.setValue("region", x)} />
      <FormInput control={f.control} name="note" label={t("adm.note")} multiline />
      {ops.length ? <SelectField label={t("admLeads.operator")} value={operatorId} options={[{ value: "", label: t("admLeads.autoOperator") }, ...ops.map((o) => ({ value: o.id, label: o.name || o.phone || o.lexgoId }))]} onChange={(x) => f.setValue("operatorId", x)} /> : null}
    </FormSheet>
  );
}
