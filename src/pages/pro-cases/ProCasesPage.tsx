import { useState } from "react";
import { useRouter } from "expo-router";
import { CaseFormSheet } from "@/features/pro-case-form";
import { useT } from "@/shared/i18n";
import { IconButton } from "@/shared/ui";
import { AdminPage } from "@/shared/ui/admin";
import { CaseList } from "@/widgets/pro-case-list";

// /pro/cases — the professional's cases; "+" opens a new one, a row opens its detail page.
export default function ProCasesPage() {
  const { t } = useT();
  const router = useRouter();
  const [add, setAdd] = useState(false);
  return (
    <AdminPage title={t("aw4.title")} subtitle={t("aw4.sub")} right={<IconButton icon="plus" onPress={() => setAdd(true)} />}>
      <CaseList onOpen={(c) => router.push(`/pro/cases/${c.id}` as never)} />
      <CaseFormSheet visible={add} onClose={() => setAdd(false)} item={null} />
    </AdminPage>
  );
}
