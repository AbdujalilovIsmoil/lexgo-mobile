import { useState } from "react";
import { MethodRow, useMethods, type PayMethod } from "@/entities/profile-extras";
import { MethodSheet, useMethodActions } from "@/features/profile-extras";
import { ActionList, AdminPage, PagedList } from "@/shared/ui/admin";
import { Card, IconButton, Text } from "@/shared/ui";
import { useSlicedList } from "@/shared/lib/pay/useSlicedList";
import { useT } from "@/shared/i18n";

// Saved cards (masked: brand, last 4, expiry) — add and remove.
export function MethodsPage() {
  const { t } = useT();
  const q = useMethods();
  const act = useMethodActions();
  const [menu, setMenu] = useState<PayMethod | null>(null);
  const [form, setForm] = useState(false);
  const { items, query } = useSlicedList(q.data ?? [], q, "m");
  return (
    <AdminPage title={t("py6.card.title")} right={<IconButton icon="plus" onPress={() => setForm(true)} />}>
      <PagedList
        data={items}
        query={query}
        keyExtractor={(m) => m.id}
        renderItem={(m) => <MethodRow item={m} onPress={() => setMenu(m)} />}
        empty={{ icon: "credit-card", title: t("py6.card.empty"), text: t("py6.card.emptyText") }}
        header={<Card tinted style={{ marginBottom: 12 }}><Text variant="small" tone="gray">{t("py6.card.note")}</Text></Card>}
      />
      <ActionList visible={!!menu} onClose={() => setMenu(null)} title={menu ? `${menu.brand.toUpperCase()} •••• ${menu.last4}` : undefined} actions={menu ? [{ key: "del", label: t("adm.delete"), icon: "trash-2", danger: true, onPress: () => act.confirmRemove(menu) }] : []} />
      <MethodSheet visible={form} onClose={() => setForm(false)} />
    </AdminPage>
  );
}
