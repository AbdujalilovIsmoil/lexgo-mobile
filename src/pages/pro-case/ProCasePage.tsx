import { useLocalSearchParams } from "expo-router";
import { useCase } from "@/entities/pro-cases";
import { useT } from "@/shared/i18n";
import { AdminPage } from "@/shared/ui/admin";
import { CaseDetail } from "@/widgets/pro-case-detail";

// /pro/cases/[id] — one case: summary, documents, tasks, events, history, AI helpers.
export default function ProCasePage() {
  const { t } = useT();
  const { id } = useLocalSearchParams<{ id: string }>();
  const item = useCase(id ?? "").data;
  return (
    <AdminPage title={item?.number || t("aw4.title")} subtitle={item?.title}>
      <CaseDetail id={id ?? ""} />
    </AdminPage>
  );
}
