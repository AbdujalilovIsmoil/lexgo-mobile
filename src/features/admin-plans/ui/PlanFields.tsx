import type { UseFormReturn } from "react-hook-form";
import { FormInput } from "@/shared/form";
import { Field, MultiChips, SelectField, SwitchField } from "@/shared/ui/admin";
import { BILLING_PERIODS } from "@/entities/admin-plans";
import { useT } from "@/shared/i18n";
import { FORM_AUDIENCES, TARGET_ROLES, type FormVals } from "../model/planForm";
import { digitsOnly } from "../model/planSchema";

type Props = { f: UseFormReturn<FormVals, unknown, FormVals> };

// All fields of the tariff form: identity, audience, billing, gift options, texts and flags.
export function PlanFields({ f }: Props) {
  const { t } = useT();
  const v = f.watch();
  const set = <K extends keyof FormVals>(k: K, val: FormVals[K]) => f.setValue(k, val as never, { shouldDirty: true });
  const tall = { minHeight: 80, textAlignVertical: "top" as const };
  return (
    <>
      <FormInput control={f.control} name="title" label={t("adm.title")} />
      <FormInput control={f.control} name="slug" label={t("admPlans.slug")} autoCapitalize="none" placeholder="premium" />
      <SelectField label={t("admPlans.audience")} value={v.audience} options={FORM_AUDIENCES.map((a) => ({ value: a, label: t(`admPlans.audiences.${a}`) }))} onChange={(x) => set("audience", x)} />
      <Field label={t("admPlans.targetRoles")} hint={t("admPlans.targetRolesHint")}>
        <MultiChips options={TARGET_ROLES.map((r) => ({ value: r, label: t(`admPlans.audiences.${r}`) }))} value={v.targetRoles} onChange={(x) => set("targetRoles", x)} />
      </Field>
      <SelectField label={t("admPlans.autoCharge")} value={v.autoChargeProvider} options={[{ value: "", label: t("admPlans.autoChargeNone") }, { value: "atmos", label: "ATMOS" }]} onChange={(x) => set("autoChargeProvider", x)} />
      <SelectField label={t("admPlans.billingPeriod")} value={v.period} options={BILLING_PERIODS.map((p) => ({ value: p, label: t(`admPlans.periods.${p}`) }))} onChange={(x) => set("period", x)} />
      <FormInput control={f.control} name="price" label={t("admPlans.price")} format={digitsOnly} keyboardType="number-pad" placeholder="149000" />
      <FormInput control={f.control} name="billingType" label={t("admPlans.billingType")} autoCapitalize="none" placeholder="subscription" />
      <FormInput control={f.control} name="sortOrder" label={t("admPlans.sortOrder")} format={digitsOnly} keyboardType="number-pad" placeholder="0" />
      <FormInput control={f.control} name="giftDurations" label={t("admPlans.giftDurations")} placeholder={t("admPlans.giftDurationsPh")} hint={t("admPlans.giftDurationsHint")} />
      <FormInput control={f.control} name="description" label={t("adm.description")} multiline style={tall} />
      <FormInput control={f.control} name="benefits" label={t("admPlans.benefits")} multiline placeholder={t("admPlans.benefitsPh")} style={{ ...tall, minHeight: 110 }} />
      <SwitchField label={t("admPlans.giftable")} value={v.isGiftable} onChange={(x) => set("isGiftable", x)} />
      <SwitchField label={t("adm.active")} value={v.isActive} onChange={(x) => set("isActive", x)} />
    </>
  );
}
