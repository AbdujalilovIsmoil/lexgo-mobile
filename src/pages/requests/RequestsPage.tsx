import { useRequestCounts } from "@/entities/pro-requests";
import { useSession } from "@/entities/session";
import { useT } from "@/shared/i18n";
import { AdvocateRequests, RequestsInbox } from "@/widgets/pro-requests-inbox";
import { OrderFeed } from "@/widgets/pro-order-feed";
import { TabPage, useTabPad } from "@/widgets/tab-page";

// So'rovlar tab: document requests, Tezkor, marketplace orders and meetings in one inbox. An advokat sees the web portal's "orders"
// group instead: new orders, service orders, Tezkor work and document requests.
export function RequestsPage() {
  return <OrdersTab />;
}

// The professional's second tab is "Buyurtmalar" now: the marketplace orders exactly as the web's "Xizmat buyurtmalari"
// (/portal/advocate/marketplace-orders) — GET /marketplace/me/orders?role_view=seller with the new assignments first. The other request kinds
// (Tezkor work, document requests, meetings) are rows of the profile page. The old inbox stays below for when it is wanted back.
function OrdersTab() {
  const { t } = useT();
  const pad = useTabPad();
  return (
    <TabPage navy title={t("tabs.bar.orders")} subtitle={t("sl9.paidOnly")}>
      <OrderFeed bottomPad={pad} />
    </TabPage>
  );
}

export function RequestsInboxPage() {
  const { t } = useT();
  const pad = useTabPad();
  const { attention } = useRequestCounts();
  const advocate = useSession()?.user.role === "advocate";
  return (
    <TabPage navy title={t("tabs.requests")} subtitle={attention ? t("aw2.attention", { n: attention }) : t("aw2.sub")}>
      {advocate ? <AdvocateRequests bottomPad={pad} /> : <RequestsInbox bottomPad={pad} />}
    </TabPage>
  );
}
