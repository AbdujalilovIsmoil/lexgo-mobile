import { useQuery } from "@tanstack/react-query";
import { useCreateRelease, listObjects, studioKeys, useStudioText } from "@/entities/admin-studio";
import { Field, FormSheet, MultiChips, SelectField } from "@/shared/ui/admin";
import { FormInput, useAppForm, useFieldError } from "@/shared/form";
import { useSheetReset } from "@/shared/lib/useSheetReset";
import { RELEASE_EMPTY, releaseSchema } from "./releaseSchema";

// New release: a title, the environment and the approved / published objects it should carry.
export function ReleaseForm({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { t, ctorName } = useStudioText();
  const tr = useFieldError();
  const f = useAppForm(releaseSchema, RELEASE_EMPTY);
  useSheetReset(visible, () => f.reset(RELEASE_EMPTY));
  const create = useCreateRelease();
  const objs = useQuery({ queryKey: [...studioKeys.all, "release-objects"], queryFn: async () => [...(await listObjects({ status: "approved", limit: 100 })).items, ...(await listObjects({ status: "published", limit: 100 })).items], enabled: visible });
  const submit = f.handleSubmit((v) => create.mutate({ title: v.title, description: v.description, environment: v.env, objectIds: v.ids }, { onSuccess: onClose }));
  const options = (objs.data ?? []).map((o) => ({ value: o.id, label: `${o.code} · ${o.title || ctorName(o.code)}` }));
  return (
    <FormSheet visible={visible} onClose={onClose} title={t("ag9.rel.new")} subtitle={t("ag9.rel.newHint")} onSubmit={() => void submit()} submitLabel={t("adm.create")} submitting={create.isPending}>
      <FormInput control={f.control} name="title" label={t("adm.title")} />
      <FormInput control={f.control} name="description" label={t("adm.description")} multiline />
      <SelectField label={t("ag9.rel.env")} value={f.watch("env")} onChange={(x) => f.setValue("env", x)} options={[{ value: "staging", label: "staging" }, { value: "production", label: "production" }]} />
      <Field label={t("ag9.rel.pickObjects")} error={tr(f.formState.errors.ids?.message)} hint={objs.isLoading ? undefined : options.length ? undefined : t("ag9.rel.noObjects")}><MultiChips options={options} value={f.watch("ids")} onChange={(x) => f.setValue("ids", x, { shouldValidate: true })} /></Field>
    </FormSheet>
  );
}
