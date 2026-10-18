import { useState } from "react";
import { ConsentRowCard, needsAction, SELLER_ONLY, useConsents, type ConsentItem } from "@/entities/profile-extras";
import { ConsentSheet } from "@/widgets/profile-extras";
import { AdminPage, PagedList } from "@/shared/ui/admin";
import { Card, Text } from "@/shared/ui";
import { useSlicedList } from "@/shared/lib/pay/useSlicedList";
import { useT } from "@/shared/i18n";

// Legal documents and the user's answers (GET /legal/consents/me): open one to read and accept it.
export function ConsentsPage() {
  const { t } = useT();
  const q = useConsents();
  const [open, setOpen] = useState<ConsentItem | null>(null);
  const rows = (q.data ?? []).filter((c) => !SELLER_ONLY.has(c.slug) || c.accepted).sort((a, b) => Number(needsAction(b)) - Number(needsAction(a)));
  const { items, query } = useSlicedList(rows, q, "c");
  const todo = rows.filter(needsAction).length;
  return (
    <AdminPage title={t("py7.title")}>
      <PagedList
        data={items}
        query={query}
        keyExtractor={(c) => c.id}
        renderItem={(c) => <ConsentRowCard item={c} onPress={() => setOpen(c)} />}
        empty={{ icon: "check-square", title: t("py7.empty") }}
        header={<Card tinted style={{ marginBottom: 12 }}><Text variant="small" tone={todo ? "warn" : "gray"}>{todo ? t("py7.todo", { n: todo }) : t("py7.allOk")}</Text></Card>}
      />
      <ConsentSheet item={open} onClose={() => setOpen(null)} />
    </AdminPage>
  );
}
