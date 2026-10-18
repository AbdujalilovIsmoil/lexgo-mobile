import { useState } from "react";
import { useAddProduct, useProducts } from "@/entities/admin-b2b";
import { FormSheet, PagedList, RowCard, StatusPill } from "@/shared/ui/admin";
import { Button } from "@/shared/ui";
import { FormInput, useAppForm } from "@/shared/form";
import { fmtMoney } from "@/shared/lib/money";
import { useSheetReset } from "@/shared/lib/useSheetReset";
import { useT } from "@/shared/i18n";
import { PRODUCT_EMPTY, digitsOnly, productSchema } from "./b2bSchema";

// B2B products (GET / POST /b2b/products): the list and a form for a new one (the API has no edit or delete).
export function ProductsView() {
  const { t } = useT();
  const q = useProducts();
  const add = useAddProduct();
  const [open, setOpen] = useState(false);
  const f = useAppForm(productSchema, PRODUCT_EMPTY);
  useSheetReset(open, () => f.reset(PRODUCT_EMPTY));
  const submit = f.handleSubmit((v) => add.mutate({ title: v.title, price: Number(v.price) || 0, description: v.description }, { onSuccess: () => setOpen(false) }));
  return (
    <>
      <PagedList
        data={q.data ?? []} query={q} keyExtractor={(x) => x.id} empty={{ icon: "package", title: t("admB2bB.noProducts") }}
        header={<Button title={t("admB2bB.newProduct")} icon="plus" variant="soft" onPress={() => setOpen(true)} style={{ marginBottom: 10 }} />}
        renderItem={(x) => <RowCard icon="package" title={x.title} subtitle={x.description || undefined} meta={x.price ? `${fmtMoney(x.price)} ${t("adm.currency")}` : undefined} right={<StatusPill status={x.status} />} />}
      />
      <FormSheet visible={open} onClose={() => setOpen(false)} title={t("admB2bB.newProduct")} onSubmit={() => void submit()} submitLabel={t("adm.create")} submitting={add.isPending}>
        <FormInput control={f.control} name="title" label={t("adm.title")} />
        <FormInput control={f.control} name="price" label={t("adm.price")} format={digitsOnly} keyboardType="number-pad" />
        <FormInput control={f.control} name="description" label={t("adm.description")} multiline />
      </FormSheet>
    </>
  );
}
