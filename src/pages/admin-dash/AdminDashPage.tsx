import { useSession } from "@/entities/session";
import { SeedDemoButton } from "@/features/admin-dash-seed";
import { DashBody } from "@/widgets/admin-dash";
import { useT } from "@/shared/i18n";
import { AdminPage } from "@/shared/ui/admin";
import { ExportButton } from "@/features/admin-export";

// Admin overview: 12 KPI tiles (each with a drill-down), revenue + funnel, payments, orders and module shortcuts.
export default function AdminDashPage() {
  const { t } = useT();
  const name = useSession()?.user.name;
  return (
    <AdminPage title={t("admHub.mod.dash.title")} subtitle={name ? t("admDash.hi", { name }) : undefined} right={<><ExportButton id="dashboard" /><SeedDemoButton /></>}>
      <DashBody />
    </AdminPage>
  );
}
