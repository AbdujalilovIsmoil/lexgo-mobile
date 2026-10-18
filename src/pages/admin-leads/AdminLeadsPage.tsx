import { AdminPage } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";
import { LeadsScreen } from "@/widgets/admin-leads";

// Sales pipeline for staff: the shared leads screen inside the admin page frame.
export default function AdminLeadsPage() {
  const { t } = useT();
  return <LeadsScreen frame={({ actions, children }) => <AdminPage title={t("admHub.mod.pipeline.title")} right={actions}>{children}</AdminPage>} />;
}
