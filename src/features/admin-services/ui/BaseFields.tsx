import type { UseFormReturn } from "react-hook-form";
import { SelectField, SwitchField } from "@/shared/ui/admin";
import type { OverlaidCategory } from "@/entities/admin-services";
import { FormInput } from "@/shared/form";
import { useT } from "@/shared/i18n";
import type { FormVals } from "../model/serviceForm";
import { digitsOnly } from "../model/serviceSchema";

type Props = { f: UseFormReturn<FormVals, unknown, FormVals>; categories: OverlaidCategory[] };

// Core fields every service has: title, category, description, price, currency, delivery time, active flag.
export function BaseFields({ f, categories }: Props) {
  const { t } = useT();
  const cats = categories.filter((c) => !c.hidden && c.isActive).map((c) => ({ value: c.id, label: c.name }));
  return (
    <>
      <FormInput control={f.control} name="title" label={t("adm.title")} />
      <SelectField label={t("admSvc.category")} value={f.watch("category_id")} options={cats} onChange={(x) => f.setValue("category_id", x)} searchable />
      <FormInput control={f.control} name="description" label={t("adm.description")} multiline style={{ minHeight: 70, textAlignVertical: "top" }} />
      <FormInput control={f.control} name="base_price" label={t("admSvcB.basePrice")} format={digitsOnly} keyboardType="number-pad" placeholder="150000" />
      <SelectField label={t("admSvcB.currency")} value={f.watch("currency")} options={["UZS", "USD", "EUR"].map((c) => ({ value: c, label: c }))} onChange={(x) => f.setValue("currency", x)} />
      <FormInput control={f.control} name="delivery_minutes" label={t("admSvcB.deliveryMinutes")} format={digitsOnly} keyboardType="number-pad" placeholder="60" />
      <SwitchField label={t("adm.active")} value={f.watch("is_active")} onChange={(x) => f.setValue("is_active", x)} />
    </>
  );
}
