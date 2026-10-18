import { useRequestCounts } from "@/entities/pro-requests";
import { useT } from "@/shared/i18n";
import { RequestsInbox } from "@/widgets/pro-requests-inbox";
import { TabPage, useTabPad } from "@/widgets/tab-page";

// So'rovlar tab: document requests, Tezkor, marketplace orders and meetings in one inbox.
export function RequestsPage() {
  const { t } = useT();
  const pad = useTabPad();
  const { attention } = useRequestCounts();
  return (
    <TabPage title={t("tabs.requests")} subtitle={attention ? t("aw2.attention", { n: attention }) : t("aw2.sub")}>
      <RequestsInbox bottomPad={pad} />
    </TabPage>
  );
}
