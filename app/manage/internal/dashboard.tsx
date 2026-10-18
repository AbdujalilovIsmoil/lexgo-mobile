import { AdminGate } from "@/entities/access";
import { PermGate } from "@/pages/admin-hrm";
import DashboardPage from "@/pages/admin-hrm/DashboardPage";

export default function Screen() {
  return (
    <AdminGate id="internal">
      <PermGate area="dashboard">
        <DashboardPage />
      </PermGate>
    </AdminGate>
  );
}
