import { CallsView } from "@/widgets/admin-calls";
import { TabPage } from "@/widgets/tab-page";
import { useT } from "@/shared/i18n";

// The sales operator's "Qo'ng'iroqlar tahlili" tab: the same analytics as the admin module, in a tab frame.
export function SalesCallsPage() {
  const { t } = useT();
  return (
    <TabPage title={t("admHub.mod.callAnalytics.title")} subtitle={t("admHub.mod.callAnalytics.desc")}>
      <CallsView tab />
    </TabPage>
  );
}
