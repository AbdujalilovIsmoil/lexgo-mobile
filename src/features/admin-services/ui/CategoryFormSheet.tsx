import { useCreateCategory, useRenameCategory, type OverlaidCategory } from "@/entities/admin-services";
import { FormSheet } from "@/shared/ui/admin";
import { FormInput, useAppForm } from "@/shared/form";
import { useT } from "@/shared/i18n";
import { categorySchema, slugify } from "../model/serviceSchema";

type Props = { visible: boolean; category: OverlaidCategory | null; onClose: () => void };

// Create a category (title, slug, description) or rename an existing one (title only).
export function CategoryFormSheet({ visible, category, onClose }: Props) {
  const { t } = useT();
  const f = useAppForm(categorySchema(!!category), { title: category?.name ?? "", slug: "", description: "" });
  const create = useCreateCategory();
  const rename = useRenameCategory();
  const submit = f.handleSubmit((v) => {
    if (category) return rename.mutate({ id: category.id, title: v.title }, { onSuccess: onClose });
    create.mutate({ slug: v.slug, title: v.title, description: v.description }, { onSuccess: onClose });
  });
  return (
    <FormSheet visible={visible} onClose={onClose} title={category ? t("admSvc.catEdit") : t("admSvc.catCreate")} subtitle={category?.slug} onSubmit={() => void submit()} submitLabel={category ? t("adm.save") : t("adm.create")} submitting={create.isPending || rename.isPending} snaps={[0.6, 0.9]}>
      <FormInput control={f.control} name="title" label={t("adm.title")} />
      {category ? null : <FormInput control={f.control} name="slug" label={t("admSvc.slug")} format={slugify} autoCapitalize="none" placeholder="criminal" />}
      {category ? null : <FormInput control={f.control} name="description" label={t("adm.description")} multiline style={{ minHeight: 70, textAlignVertical: "top" }} />}
    </FormSheet>
  );
}
