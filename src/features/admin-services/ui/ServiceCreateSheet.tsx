import { useCreateService, type OverlaidCategory } from "@/entities/admin-services";
import { FormSheet, SelectField, SwitchField } from "@/shared/ui/admin";
import { FormInput, useAppForm, useFieldError } from "@/shared/form";
import { useT } from "@/shared/i18n";
import { SERVICE_EMPTY, digitsOnly, serviceCreateSchema, slugify } from "../model/serviceSchema";

// New service (POST /admin/services): category, title, slug, description, price, delivery time, active flag.
export function ServiceCreateSheet({ visible, categories, onClose }: { visible: boolean; categories: OverlaidCategory[]; onClose: () => void }) {
  const { t } = useT();
  const tr = useFieldError();
  const f = useAppForm(serviceCreateSchema, SERVICE_EMPTY);
  const create = useCreateService();
  const submit = f.handleSubmit((v) => create.mutate(
    { category_id: v.category_id, title: v.title, slug: v.slug, description: v.description, base_price: Number(v.base_price) || 0, currency: "UZS", delivery_minutes: Number(v.delivery_minutes) || 0, is_active: v.is_active },
    { onSuccess: () => { f.reset(SERVICE_EMPTY); onClose(); } },
  ));
  const cats = categories.filter((c) => !c.hidden && c.isActive).map((c) => ({ value: c.id, label: c.name }));
  return (
    <FormSheet visible={visible} onClose={onClose} title={t("admSvc.createTitle")} onSubmit={() => void submit()} submitLabel={t("adm.create")} submitting={create.isPending}>
      <SelectField label={t("admSvc.category")} value={f.watch("category_id")} options={cats} onChange={(x) => f.setValue("category_id", x, { shouldValidate: true })} error={tr(f.formState.errors.category_id?.message)} searchable />
      <FormInput control={f.control} name="title" label={t("adm.title")} />
      <FormInput control={f.control} name="slug" label={t("admSvc.slug")} format={slugify} autoCapitalize="none" />
      <FormInput control={f.control} name="description" label={t("adm.description")} multiline style={{ minHeight: 70, textAlignVertical: "top" }} />
      <FormInput control={f.control} name="base_price" label={t("admSvcB.basePrice")} format={digitsOnly} keyboardType="number-pad" placeholder="150000" />
      <FormInput control={f.control} name="delivery_minutes" label={t("admSvcB.deliveryMinutes")} format={digitsOnly} keyboardType="number-pad" placeholder="60" />
      <SwitchField label={t("adm.active")} value={f.watch("is_active")} onChange={(x) => f.setValue("is_active", x)} />
    </FormSheet>
  );
}
