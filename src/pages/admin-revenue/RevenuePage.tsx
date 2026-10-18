import { RevenueBody } from "@/widgets/admin-dash";
import { useT } from "@/shared/i18n";
import { AdminPage } from "@/shared/ui/admin";

// Full-screen revenue: opened from the revenue hero on Home. Own period/region filter, the scrubbable chart,
// payments, channels and the MRR / ARR / ARPU / GMV facts.
export default function RevenuePage() {
  const { t } = useT();
  return (
    <AdminPage title={t("admDashC.crm.revenue")}>
      <RevenueBody />
    </AdminPage>
  );
}
