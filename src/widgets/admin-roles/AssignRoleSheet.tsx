import { useState } from "react";
import { useAssignRole, useRoles } from "@/entities/admin-roles";
import { UserPickerSheet } from "@/features/admin-user-picker";
import { UserRow, type UserHit } from "@/entities/admin-users";
import { Field, FormSheet, SelectField } from "@/shared/ui/admin";
import { Button, confirmDialog } from "@/shared/ui";
import { useSheetReset } from "@/shared/lib/useSheetReset";
import { useT } from "@/shared/i18n";

// Give a person a role: find them (name / phone / LexGo id), choose the role, confirm.
export function AssignRoleSheet({ visible, roleId: initial = "", onClose }: { visible: boolean; roleId?: string; onClose: () => void }) {
  const { t } = useT();
  const roles = useRoles();
  const assign = useAssignRole();
  const [user, setUser] = useState<UserHit | null>(null);
  const [roleId, setRoleId] = useState("");
  const [picking, setPicking] = useState(false);
  useSheetReset(visible, () => { setUser(null); setRoleId(initial); });
  const role = (roles.data ?? []).find((r) => r.id === roleId);
  // A role change alters what a person may do, so it is confirmed first.
  const submit = () => user && confirmDialog({ title: t("admRolesB.confirmTitle"), message: t("admRolesB.confirmText", { user: user.name || user.phone || user.id, role: role?.title || role?.name || "" }), confirmLabel: t("admRoles.assign"), cancelLabel: t("adm.cancel"), icon: "user-check", onConfirm: async () => { await assign.mutateAsync({ userId: user.id, roleId }); onClose(); } });
  return (
    <FormSheet visible={visible} onClose={onClose} title={t("admRoles.assignTitle")} subtitle={t("admRoles.assignLead")} submitLabel={t("admRoles.assign")} onSubmit={submit} submitting={assign.isPending} disabled={!user || !roleId}>
      <Field label={t("admRoles.user")}>
        {user ? <UserRow user={user} onPress={() => setPicking(true)} /> : <Button title={t("admRoles.selectUser")} icon="user-plus" variant="line" full onPress={() => setPicking(true)} />}
      </Field>
      <SelectField label={t("admRoles.role")} value={roleId} placeholder={t("admRoles.selectRole")} options={(roles.data ?? []).map((r) => ({ value: r.id, label: r.title || r.name, hint: r.name }))} onChange={setRoleId} searchable />
      <UserPickerSheet visible={picking} onClose={() => setPicking(false)} title={t("admRoles.selectUser")} onPick={setUser} />
    </FormSheet>
  );
}
