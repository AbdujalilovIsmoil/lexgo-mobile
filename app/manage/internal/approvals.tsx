import { AdminGate } from "@/entities/access";
import { PermGate } from "@/pages/admin-hrm";
import MyApprovalsPage from "@/pages/admin-hrm/MyApprovalsPage";

export default function Screen() {
  return (
    <AdminGate id="internal">
      <PermGate area="approvals">
        <MyApprovalsPage />
      </PermGate>
    </AdminGate>
  );
}
