import { useRequestCounts } from "@/entities/pro-requests";
import { useSession } from "@/entities/session";
import { useT } from "@/shared/i18n";
import { AdvocateRequests, RequestsInbox } from "@/widgets/pro-requests-inbox";
import { TabPage, useTabPad } from "@/widgets/tab-page";

// So'rovlar tab: document requests, Tezkor, marketplace orders and meetings in one inbox. An advokat sees the web portal's "orders"
// group instead: new orders, service orders, Tezkor work and document requests.
export function RequestsPage() {
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
