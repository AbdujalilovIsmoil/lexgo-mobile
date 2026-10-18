import { useT } from "@/shared/i18n";
import { AdminPage } from "@/shared/ui/admin";
import { ProStats } from "@/widgets/pro-stats";

// /pro/stats — professional statistics.
export default function ProStatsPage() {
  const { t } = useT();
  return (
    <AdminPage title={t("aw9.title")} subtitle={t("aw9.sub")}>
      <ProStats />
    </AdminPage>
  );
}
