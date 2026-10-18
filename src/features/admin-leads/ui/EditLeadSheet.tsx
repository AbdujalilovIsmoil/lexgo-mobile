import { FormInput, FormPhoneInput, useAppForm } from "@/shared/form";
import { FormSheet, SelectField } from "@/shared/ui/admin";
import { useSheetReset } from "@/shared/lib/useSheetReset";
import { useT } from "@/shared/i18n";
import { categoryLabel, regionLabel, urgencyLabel, useEditLead, type Lead } from "@/entities/admin-leads";
import { LEAD_CATEGORIES, LEAD_REGIONS, LEAD_URGENCIES } from "../model/options";
import { editLeadSchema } from "../model/leadSchemas";

type Tr = ReturnType<typeof useT>["t"];
const BLANK = { name: "", phone: "", category: "", region: "", urgency: "", note: "" };
const fromLead = (l: Lead) => ({ name: l.name, phone: l.phone, category: l.category, region: l.region.toLowerCase(), urgency: l.urgency.toLowerCase(), note: l.note });

// Edit a lead's contact data and classification (PATCH; details are merged so nothing else is lost).
export function EditLeadSheet({ lead, onClose }: { lead: Lead | null; onClose: () => void }) {
  const { t } = useT();
  const f = useAppForm(editLeadSchema, lead ? fromLead(lead) : BLANK);
  useSheetReset(!!lead, () => f.reset(lead ? fromLead(lead) : BLANK));
  const edit = useEditLead();
  const [category, region, urgency] = f.watch(["category", "region", "urgency"]);
  const submit = f.handleSubmit((v) => { if (lead) edit.mutate({ lead, edit: v }, { onSuccess: onClose }); });
  const opt = (list: string[], label: (t: Tr, x: string) => string, keep: string) => [{ value: "", label: t("admLeads.notSet") }, ...[...new Set([...list, ...(keep ? [keep] : [])])].map((x) => ({ value: x, label: label(t, x) }))];
  return (
    <FormSheet visible={!!lead} onClose={onClose} title={t("cc5.editTitle")} onSubmit={() => void submit()} submitLabel={t("adm.save")} submitting={edit.isPending}>
      <FormInput control={f.control} name="name" label={t("adm.name")} autoCapitalize="words" />
      <FormPhoneInput control={f.control} name="phone" label={t("adm.phone")} />
      <SelectField label={t("admLeads.category")} value={category} options={opt(LEAD_CATEGORIES, categoryLabel, category)} onChange={(x) => f.setValue("category", x)} />
      <SelectField label={t("admLeads.region")} value={region} options={opt(LEAD_REGIONS, regionLabel, region)} onChange={(x) => f.setValue("region", x)} />
      <SelectField label={t("admLeads.urgency")} value={urgency} options={opt(LEAD_URGENCIES, urgencyLabel, urgency)} onChange={(x) => f.setValue("urgency", x)} />
      <FormInput control={f.control} name="note" label={t("adm.note")} multiline />
    </FormSheet>
  );
}
