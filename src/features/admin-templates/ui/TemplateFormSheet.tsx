import { useEffect } from "react";
import { useCreateTemplate, useTemplateBody, useUpdateTemplate, type Template } from "@/entities/admin-templates";
import { FormSheet, SwitchField } from "@/shared/ui/admin";
import { FormInput, useAppForm } from "@/shared/form";
import { Skeleton } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { EMPTY, seedFrom, toBody } from "../model/templateForm";
import { digitsOnly, templateSchema } from "../model/templateSchema";
import { PlaceholderPreview } from "./PlaceholderPreview";

type Props = { template: Template | null; visible: boolean; onClose: () => void };

// Create or edit a template, including the long `template_text` body with {{field}} placeholders.
export function TemplateFormSheet({ template, visible, onClose }: Props) {
  const { t } = useT();
  const body = useTemplateBody(template);
  const f = useAppForm(templateSchema, EMPTY);
  const create = useCreateTemplate();
  const update = useUpdateTemplate();
  const { reset } = f;
  const loading = !!template && body.isLoading;
  useEffect(() => { if (body.data) reset(seedFrom(body.data)); }, [body.data, reset]);
  const submit = f.handleSubmit((v) => {
    if (template) update.mutate({ id: template.id, body: toBody(v) }, { onSuccess: onClose });
    else create.mutate(toBody(v), { onSuccess: onClose });
  });
  return (
    <FormSheet visible={visible} onClose={onClose} title={template ? t("admTpl.editTitle") : t("admTpl.create")} subtitle={template?.slug} onSubmit={loading ? undefined : () => void submit()} submitLabel={template ? t("adm.save") : t("adm.create")} submitting={create.isPending || update.isPending} snaps={[0.85, 0.96]}>
      {loading ? <Skeleton height={200} round={20} /> : (
        <>
          <FormInput control={f.control} name="title" label={t("adm.title")} />
          <FormInput control={f.control} name="slug" label={t("admTpl.slug")} autoCapitalize="none" placeholder="lease-agreement" />
          <FormInput control={f.control} name="category" label={t("admTpl.category")} autoCapitalize="none" placeholder="contract" />
          <FormInput control={f.control} name="language" label={t("admTpl.language")} autoCapitalize="none" placeholder="uz" />
          <FormInput control={f.control} name="description" label={t("adm.description")} multiline style={{ minHeight: 70, textAlignVertical: "top" }} />
          <FormInput control={f.control} name="template_text" label={t("admTpl.templateText")} multiline autoCapitalize="none" hint={t("admTpl.templateHint")} style={{ minHeight: 220, textAlignVertical: "top" }} />
          <PlaceholderPreview text={f.watch("template_text")} />
          <FormInput control={f.control} name="price" label={t("admTpl.price")} format={digitsOnly} keyboardType="number-pad" placeholder="0" />
          <SwitchField label={t("adm.active")} value={f.watch("is_active")} onChange={(x) => f.setValue("is_active", x)} />
        </>
      )}
    </FormSheet>
  );
}
