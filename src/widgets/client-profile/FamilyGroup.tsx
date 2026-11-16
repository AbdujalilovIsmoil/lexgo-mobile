import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { useFamily, type FamilyMember } from "@/entities/profile-extras";
import { FamilySheet, useFamilyActions } from "@/features/profile-extras";
import { EmptyState, ErrorView, ListGroup, Skeleton, Text } from "@/shared/ui";
import { ActionList } from "@/shared/ui/admin";
import { AddRow } from "@/shared/ui/profile";
import { useT } from "@/shared/i18n";

// "Oila a'zolari" (Adliya): the lead, the members as one grouped card (name; relation · phone · access), "A'zo qo'shish" under it.
// A member opens its actions: edit, give / take access, remove (GET/POST/PATCH/DELETE /clients/me/family-members).
export function FamilyGroup() {
  const { t } = useT();
  const q = useFamily();
  const act = useFamilyActions();
  const [menu, setMenu] = useState<FamilyMember | null>(null);
  const [form, setForm] = useState<{ open: boolean; member: FamilyMember | null }>({ open: false, member: null });
  const rows = q.data ?? [];
  const add = () => setForm({ open: true, member: null });
  return (
    <View style={s.col}>
      <Text variant="body" tone="gray" style={s.lead}>{t("py6.note")}</Text>
      {q.isLoading ? <Skeleton height={140} round={18} /> : q.isError ? <ErrorView error={q.error} onRetry={() => void q.refetch()} compact /> : rows.length ? (
        <ListGroup items={rows.map((m) => ({
          key: m.id,
          title: m.name || m.phone,
          sub: [m.relation, m.name ? m.phone : "", m.sharedAccess ? t("py6.shared") : ""].filter(Boolean).join(" · "),
          onPress: () => setMenu(m),
        }))} />
      ) : <EmptyState compact icon="users" title={t("py6.empty")} text={t("py6.emptyText")} />}
      <AddRow accent="blue" icon="user-plus" label={t("py6.add")} onPress={add} />
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
    </View>
  );
}

const s = StyleSheet.create({ col: { gap: 14 }, lead: { fontSize: 15, lineHeight: 21 } });
