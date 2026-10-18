import { useCreateRole, usePermissions } from "@/entities/admin-roles";
import { Field, FormSheet, MultiChips } from "@/shared/ui/admin";
import { Skeleton, Text } from "@/shared/ui";
import { FormInput, useAppForm } from "@/shared/form";
import { useSheetReset } from "@/shared/lib/useSheetReset";
import { useT } from "@/shared/i18n";
import { roleSchema } from "./roleSchema";

const EMPTY = { name: "", title: "", description: "", permissions: [] as string[] };
const slug = (v: string) => v.toLowerCase().replace(/[^a-z0-9_]/g, "_");

// New role: a code name, a title, a description and the permissions it grants (POST /admin/roles).
export function CreateRoleSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { t } = useT();
  const f = useAppForm(roleSchema, EMPTY);
  const perms = usePermissions();
  const create = useCreateRole();
  const permissions = f.watch("permissions");
  useSheetReset(visible, () => f.reset(EMPTY));
  const submit = f.handleSubmit((v) => create.mutate(v, { onSuccess: onClose }));
  return (
    <FormSheet visible={visible} onClose={onClose} title={t("admRoles.create")} submitLabel={t("adm.create")} onSubmit={() => void submit()} submitting={create.isPending}>
      <FormInput control={f.control} name="name" label={t("admRoles.name")} format={slug} placeholder="content_manager" autoCapitalize="none" autoCorrect={false} />
      <FormInput control={f.control} name="title" label={t("adm.title")} />
      <FormInput control={f.control} name="description" label={t("adm.description")} multiline />
      <Field label={`${t("admRoles.permissions")} · ${permissions.length}`}>
        {perms.isLoading ? <Skeleton height={80} round={16} /> : perms.isError ? <Text variant="small" tone="err">{t("common.serverError")}</Text> : (
          <MultiChips options={(perms.data ?? []).map((p) => ({ value: p.code, label: p.title }))} value={permissions} onChange={(v) => f.setValue("permissions", v)} />
        )}
      </Field>
    </FormSheet>
  );
}
