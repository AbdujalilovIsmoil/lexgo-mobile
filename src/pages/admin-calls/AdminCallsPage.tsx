import { CallsView } from "@/widgets/admin-calls";
import { useT } from "@/shared/i18n";
import { AdminPage } from "@/shared/ui/admin";

// Call analytics (admin module).
export default function AdminCallsPage() {
  const { t } = useT();
  return (
    <AdminPage title={t("admHub.mod.callAnalytics.title")}>
      <CallsView />
    </AdminPage>
  );
}
