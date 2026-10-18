import { AdminGate } from "@/entities/access";
import AdminAuditPage from "@/pages/admin-audit/AdminAuditPage";

export default function Screen() {
  return (
    <AdminGate id="audit">
      <AdminAuditPage />
    </AdminGate>
  );
}
