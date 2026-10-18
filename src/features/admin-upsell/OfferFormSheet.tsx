import { useState } from "react";
import { useCreateOffer } from "@/entities/admin-upsell";
import { usePlans } from "@/entities/admin-plans";
import { type UserHit } from "@/entities/admin-users";
import { UserPickerSheet } from "@/features/admin-user-picker";
import { DateField, Field, FormSheet, SelectField } from "@/shared/ui/admin";
import { FormInput, useAppForm, useFieldError } from "@/shared/form";
import { Button } from "@/shared/ui";
import { useSheetReset } from "@/shared/lib/useSheetReset";
import { useT } from "@/shared/i18n";
import { OFFER_EMPTY, offerSchema } from "./offerSchema";

// New personal offer: pick the client, name it, price it (optionally tied to a subscription plan) and set a last day.
export function OfferFormSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { t } = useT();
  const tr = useFieldError();
  const f = useAppForm(offerSchema, OFFER_EMPTY);
  const [client, setClient] = useState<UserHit | null>(null);
  const [pick, setPick] = useState(false);
  useSheetReset(visible, () => { f.reset(OFFER_EMPTY); setClient(null); });
  const plans = usePlans().data?.plans.filter((p) => p.isActive && !p.hidden) ?? [];
  const create = useCreateOffer();
  const submit = f.handleSubmit((v) => create.mutate({ clientId: v.clientId, title: v.title, price: Number(v.price) || 0, planId: v.planId, reason: v.reason, validUntil: v.until }, { onSuccess: onClose }));
  const onPick = (u: UserHit) => { setClient(u); f.setValue("clientId", u.id, { shouldValidate: true }); };
  return (
    <FormSheet visible={visible} onClose={onClose} title={t("ag6.offer.new")} subtitle={t("ag6.offer.hint")} onSubmit={() => void submit()} submitLabel={t("adm.create")} submitting={create.isPending}>
      <Field error={tr(f.formState.errors.clientId?.message)}>
        <Button title={client ? `${client.name || client.phone} · ${client.lexgoId}` : t("ag6.offer.pickClient")} icon="user" variant="soft" onPress={() => setPick(true)} />
      </Field>
      <FormInput control={f.control} name="title" label={t("adm.title")} />
      <FormInput control={f.control} name="price" label={t("adm.price")} format={(x) => x.replace(/\D/g, "")} keyboardType="number-pad" />
      <SelectField label={t("ag6.offer.plan")} value={f.watch("planId")} onChange={(x) => f.setValue("planId", x)} options={[{ value: "", label: t("ag6.offer.noPlan") }, ...plans.map((p) => ({ value: p.id, label: p.name }))]} />
      <FormInput control={f.control} name="reason" label={t("adm.reason")} multiline />
      <Field error={tr(f.formState.errors.until?.message)}>
        <DateField label={t("ag6.offer.validUntil")} value={f.watch("until")} onChange={(x) => f.setValue("until", x, { shouldValidate: true })} />
      </Field>
      <UserPickerSheet visible={pick} onClose={() => setPick(false)} title={t("ag6.offer.pickClient")} onPick={onPick} />
    </FormSheet>
  );
}
