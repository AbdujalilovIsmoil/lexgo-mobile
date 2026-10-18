import { View } from "react-native";
import type { UserDetail } from "@/entities/admin-users";
import { useDeleteUser, useUpdateUser } from "@/entities/admin-users";
import { Button, confirmDialog } from "@/shared/ui";
import { useT } from "@/shared/i18n";

type Props = { user: UserDetail; onEdit: () => void; on360: () => void; onDone: () => void };

// What an admin can do with one user: edit, open the client 360, block / activate, delete (soft). Risky ones ask first.
export function UserActions({ user, onEdit, on360, onDone }: Props) {
  const { t } = useT();
  const upd = useUpdateUser();
  const del = useDeleteUser();
  const gone = user.status === "deleted";
  const blocked = user.status === "blocked";
  const name = user.name || user.phone;
  const setStatus = (status: string) => upd.mutate({ id: user.id, edit: { firstName: user.firstName, lastName: user.lastName, middleName: user.middleName, status } }, { onSuccess: onDone });
  const toggle = () => (blocked ? setStatus("active") : confirmDialog({ title: t("ag3.confirm.blockTitle"), message: t("ag3.confirm.blockText", { name }), confirmLabel: t("ag3.act.block"), cancelLabel: t("adm.cancel"), icon: "slash", danger: true, onConfirm: () => setStatus("blocked") }));
  const remove = () => confirmDialog({ title: t("ag3.confirm.delTitle"), message: t("ag3.confirm.delText", { name }), confirmLabel: t("ag3.act.del"), cancelLabel: t("adm.cancel"), icon: "trash-2", danger: true, onConfirm: async () => { await del.mutateAsync(user.id); onDone(); } });
  return (
    <View style={{ gap: 10 }}>
      <View style={{ flexDirection: "row", gap: 10 }}>
        <Button title={t("ag3.act.edit")} icon="edit-2" variant="soft" onPress={onEdit} style={{ flex: 1 }} />
        {user.role === "client" ? <Button title={t("ag3.act.c360")} icon="activity" variant="soft" onPress={on360} style={{ flex: 1 }} /> : null}
      </View>
      {gone ? null : (
        <View style={{ flexDirection: "row", gap: 10 }}>
          <Button title={blocked ? t("ag3.act.unblock") : t("ag3.act.block")} icon={blocked ? "unlock" : "slash"} variant="line" loading={upd.isPending} onPress={toggle} style={{ flex: 1 }} />
          <Button title={t("ag3.act.del")} icon="trash-2" variant="line" loading={del.isPending} onPress={remove} style={{ flex: 1 }} />
        </View>
      )}
    </View>
  );
}
