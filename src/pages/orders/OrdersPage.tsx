import { MyOrders } from "@/widgets/order-list";
import { TabPage } from "@/widgets/tab-page";
import { useT } from "@/shared/i18n";

// Client "My orders" (hidden tab, reached from Profil and from a purchase): marketplace
// purchases from /marketplace/me/orders plus the non-marketplace service orders from /orders.
export function OrdersPage() {
  const { t } = useT();
  return (
    <TabPage title={t("mk4.title")} subtitle={t("mk7.clientLead")}>
      <MyOrders />
    </TabPage>
  );
}
