import { AdminGate } from "@/entities/access";
import AdminApprovalsPage from "@/pages/admin-approvals/AdminApprovalsPage";

export default function Screen() {
  return (
    <AdminGate id="approvals">
      <AdminApprovalsPage />
    </AdminGate>
  );
}
