import { useT } from "@/shared/i18n";
import { AdminPage } from "@/shared/ui/admin";
import { OrderFeed } from "@/widgets/pro-order-feed";

// Marketplace orders of this seller (GET /marketplace/me/orders?role_view=seller). Only paid orders ever reach it (TZ 18).
export default function ProOrdersPage() {
  const { t } = useT();
  return (
    <AdminPage title={t("lsb.marketplaceOrders")} subtitle={t("sl9.paidOnly")}>
      <OrderFeed />
    </AdminPage>
  );
}
