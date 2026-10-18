import { useState } from "react";
import { Button, Segmented, Text } from "@/shared/ui";
import { Field, FormSheet, MultiChips, SwitchField } from "@/shared/ui/admin";
import { STUDIO_ROLES, saveGrant, studioKeys, useStudioText, type StudioGrant } from "@/entities/admin-studio";
import { useAppForm, useFieldError } from "@/shared/form";
import { UserPickerSheet } from "@/features/admin-user-picker";
import { useAdminMutation } from "@/shared/lib/useAdminMutation";
import { useT } from "@/shared/i18n";
import { grantSchema } from "./grantSchema";

type Picked = { id: string; name: string; phone: string };
type Props = { visible: boolean; grant: StudioGrant | null; grants: StudioGrant[]; codes: string[]; onClose: () => void };

// Grant (or change) studio roles for a user: roles, which constructors, active or paused.
export function GrantSheet({ visible, grant, grants, codes, onClose }: Props) {
  const { t } = useT();
  const { role } = useStudioText();
  const [picked, setPicked] = useState<Picked | null>(null);
  const tr = useFieldError();
  const f = useAppForm(grantSchema, { userId: "", roles: ["studio_editor"], scope: "all", codes: [], active: true });
  const { roles, scope, codes: picks, active } = f.watch();
  const [finding, setFinding] = useState(false);
  const key = visible ? grant?.id || "new" : "";
  const [seen, setSeen] = useState("");
  if (seen !== key) {
    setSeen(key);
    if (key) {
      setPicked(grant ? { id: grant.userId, name: grant.userName, phone: grant.phone } : null);
      f.reset({ userId: grant?.userId ?? "", roles: grant ? grant.roles.filter((r) => (STUDIO_ROLES as readonly string[]).includes(r)) : ["studio_editor"], scope: grant?.codes.length ? "some" : "all", codes: grant?.codes ?? [], active: grant ? grant.active : true });
    }
  }
  const target = grant ?? (picked ? grants.find((g) => g.userId === picked.id) : undefined);
  const save = useAdminMutation({ mutationFn: saveGrant, invalidate: [[...studioKeys.all, "grants"]], success: "admStudioC.access.saved", onSuccess: onClose });
  const submit = f.handleSubmit((v) => save.mutate({ id: target?.id, userId: v.userId, roles: STUDIO_ROLES.filter((r) => v.roles.includes(r)), codes: v.scope === "all" ? [] : v.codes, active: v.active }));
  return (
    <>
      <FormSheet visible={visible} onClose={onClose} title={t(grant ? "admStudioC.access.editTitle" : "admStudioC.access.newTitle")} onSubmit={() => void submit()} submitLabel={t("adm.save")} submitting={save.isPending} snaps={[0.8, 0.95]}>
        <Field label={t("admStudioC.access.user")} error={tr(f.formState.errors.userId?.message)}>
          {picked ? <Text variant="body" weight="bold">{picked.name || picked.phone || picked.id}{picked.phone && picked.name ? ` · ${picked.phone}` : ""}</Text> : <Text variant="small" tone="gray">{t("admStudioC.access.userHint")}</Text>}
          {grant ? null : <Button title={t(picked ? "admStudioC.access.changeUser" : "admStudioC.access.pickUser")} icon="user-plus" variant="soft" size="sm" onPress={() => setFinding(true)} />}
          {target && !grant ? <Text variant="caption" tone="gray">{t("admStudioC.access.existing")}</Text> : null}
        </Field>
        <Field label={`${t("admStudioC.access.roles")} *`} error={tr(f.formState.errors.roles?.message)}><MultiChips options={STUDIO_ROLES.map((r) => ({ value: r, label: role(r) }))} value={roles} onChange={(x) => f.setValue("roles", x, { shouldValidate: true })} /></Field>
        <Field label={t("admStudioC.access.scope")} error={tr(f.formState.errors.codes?.message)}>
          <Segmented value={scope} onChange={(x) => f.setValue("scope", x, { shouldValidate: true })} options={[{ value: "all", label: t("admStudioC.access.scopeAll") }, { value: "some", label: t("admStudioC.access.scopeSome") }]} />
          {scope === "some" ? <MultiChips options={[...new Set([...codes, ...picks])].map((c) => ({ value: c, label: c }))} value={picks} onChange={(x) => f.setValue("codes", x, { shouldValidate: true })} /> : <Text variant="caption" tone="gray">{t("admStudioC.access.scopeAllHint")}</Text>}
        </Field>
        <SwitchField label={t("admStudioC.access.activeLabel")} value={active} onChange={(x) => f.setValue("active", x, { shouldValidate: true })} />
      </FormSheet>
      <UserPickerSheet visible={finding} onClose={() => setFinding(false)} title={t("admStudioC.access.user")} onPick={(u) => { setPicked({ id: u.id, name: u.name, phone: u.phone }); f.setValue("userId", u.id, { shouldValidate: true }); }} />
    </>
  );
}
