import { useState } from "react";
import { FamilyRow, useFamily, type FamilyMember } from "@/entities/profile-extras";
import { FamilySheet, useFamilyActions } from "@/features/profile-extras";
import { ActionList, AdminPage, PagedList } from "@/shared/ui/admin";
import { Card, IconButton, Text } from "@/shared/ui";
import { useSlicedList } from "@/shared/lib/pay/useSlicedList";
import { useT } from "@/shared/i18n";

// Family members who may be covered by the plan (GET/POST/PATCH/DELETE /clients/me/family-members).
export function FamilyPage() {
  const { t } = useT();
  const q = useFamily();
  const act = useFamilyActions();
  const [menu, setMenu] = useState<FamilyMember | null>(null);
  const [form, setForm] = useState<{ open: boolean; member: FamilyMember | null }>({ open: false, member: null });
  const rows = q.data ?? [];
  const { items, query } = useSlicedList(rows, q, "f");
  return (
    <AdminPage title={t("py6.title")} right={<IconButton icon="plus" onPress={() => setForm({ open: true, member: null })} />}>
      <PagedList
        data={items}
        query={query}
        keyExtractor={(m) => m.id}
        renderItem={(m) => <FamilyRow item={m} onPress={() => setMenu(m)} />}
        empty={{ icon: "users", title: t("py6.empty"), text: t("py6.emptyText") }}
        header={<Card tinted style={{ marginBottom: 12 }}><Text variant="small" tone="gray">{t("py6.note")}</Text></Card>}
      />
      <ActionList
        visible={!!menu}
        onClose={() => setMenu(null)}
        title={menu?.name || menu?.phone}
        actions={menu ? [
          { key: "edit", label: t("adm.edit"), icon: "edit-3", onPress: () => setForm({ open: true, member: menu }) },
          { key: "share", label: t(menu.sharedAccess ? "py6.unshare" : "py6.doShare"), icon: "users", onPress: () => act.share.mutate({ id: menu.id, on: !menu.sharedAccess }) },
          { key: "del", label: t("adm.delete"), icon: "trash-2", danger: true, onPress: () => act.confirmRemove(menu) },
        ] : []}
      />
      <FamilySheet visible={form.open} member={form.member} others={rows} onClose={() => setForm((f) => ({ ...f, open: false }))} />
    </AdminPage>
  );
}
