import { FormSheet } from "@/shared/ui/admin";
import { FormInput, useAppForm } from "@/shared/form";
import { useT } from "@/shared/i18n";
import { useAddClient } from "@/entities/admin-b2b";
import { CLIENT_EMPTY, clientSchema, digitsOnly } from "./b2bSchema";

// New corporate client: company, tax id, director, industry, contact, monthly payment and SLA.
export function ClientFormSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { t } = useT();
  const f = useAppForm(clientSchema, CLIENT_EMPTY);
  const add = useAddClient();
  const submit = f.handleSubmit((v) => add.mutate(v, { onSuccess: () => { f.reset(CLIENT_EMPTY); onClose(); } }));
  return (
    <FormSheet visible={visible} onClose={onClose} title={t("admB2b.add")} onSubmit={() => void submit()} submitLabel={t("adm.save")} submitting={add.isPending}>
      <FormInput control={f.control} name="name" label={t("admB2b.cName")} />
      <FormInput control={f.control} name="inn" label={t("admB2b.cInn")} format={digitsOnly} keyboardType="number-pad" placeholder="123456789" />
      <FormInput control={f.control} name="director" label={t("admB2b.cDirector")} autoCapitalize="words" />
      <FormInput control={f.control} name="industry" label={t("admB2b.cIndustry")} />
      <FormInput control={f.control} name="contact" label={t("admB2b.cContact")} keyboardType="phone-pad" placeholder="+998 __ ___ __ __" />
      <FormInput control={f.control} name="monthly" label={t("admB2b.cMonthly")} format={digitsOnly} keyboardType="number-pad" placeholder="0" />
      <FormInput control={f.control} name="sla" label={t("admB2b.cSla")} placeholder={t("admB2b.cSlaPh")} />
    </FormSheet>
  );
}
