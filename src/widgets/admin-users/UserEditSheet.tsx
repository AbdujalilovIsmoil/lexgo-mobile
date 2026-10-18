import type { UserDetail } from "@/entities/admin-users";
import { useUpdateUser } from "@/entities/admin-users";
import { FormSheet, SelectField } from "@/shared/ui/admin";
import { FormInput, useAppForm } from "@/shared/form";
import { useSheetReset } from "@/shared/lib/useSheetReset";
import { useT } from "@/shared/i18n";
import { userEditSchema } from "./userEditSchema";

const STATES = ["active", "blocked", "pending"];
const BLANK = { first: "", last: "", middle: "", status: "active" };

// Name parts and account status of one user (PATCH /admin/users/{id}).
export function UserEditSheet({ user, onClose }: { user: UserDetail | null; onClose: () => void }) {
  const { t } = useT();
  const f = useAppForm(userEditSchema, BLANK);
  useSheetReset(!!user, () => user && f.reset({ first: user.firstName, last: user.lastName, middle: user.middleName, status: user.status }));
  const states = user && !STATES.includes(user.status) ? [...STATES, user.status] : STATES;
  const save = useUpdateUser();
  const submit = f.handleSubmit((v) => { if (user) save.mutate({ id: user.id, edit: { firstName: v.first, lastName: v.last, middleName: v.middle, status: v.status } }, { onSuccess: onClose }); });
  return (
    <FormSheet visible={!!user} onClose={onClose} title={t("ag3.edit.title")} subtitle={user?.lexgoId} onSubmit={() => void submit()} submitting={save.isPending}>
      <FormInput control={f.control} name="first" label={t("ag3.edit.first")} autoCapitalize="words" />
      <FormInput control={f.control} name="last" label={t("ag3.edit.last")} autoCapitalize="words" />
      <FormInput control={f.control} name="middle" label={t("ag3.edit.middle")} autoCapitalize="words" />
      <SelectField label={t("ag3.edit.status")} value={f.watch("status")} onChange={(x) => f.setValue("status", x)} options={states.map((s) => ({ value: s, label: t(`admSt.${s}`) === `admSt.${s}` ? s : t(`admSt.${s}`) }))} />
    </FormSheet>
  );
}
