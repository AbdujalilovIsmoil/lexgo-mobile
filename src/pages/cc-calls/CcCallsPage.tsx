import { CallsPanel } from "@/widgets/admin-callcenter";
import { AdminPage } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";

// /cc/calls: the operator's own call log (direction filter) and the manual "log a call / note" form.
export default function CcCallsPage() {
  const { t } = useT();
  return (
    <AdminPage title={t("cc1.tools.calls")} subtitle={t("cc1.callsSub")}>
      <CallsPanel />
    </AdminPage>
  );
}
