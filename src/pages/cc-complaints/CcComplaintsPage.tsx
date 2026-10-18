import { ComplaintsPanel } from "@/widgets/admin-callcenter";
import { AdminPage } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";

// /cc/complaints: the quality-complaint queue (opened by low ratings). Open one to read the complaint, the work and the
// delivered document, then rule: justified → free redo for that advocate; unjustified → close with a note to the client.
export default function CcComplaintsPage() {
  const { t } = useT();
  return (
    <AdminPage title={t("admCcB.complaintTitle")} subtitle={t("cc4.sub")}>
      <ComplaintsPanel />
    </AdminPage>
  );
}
