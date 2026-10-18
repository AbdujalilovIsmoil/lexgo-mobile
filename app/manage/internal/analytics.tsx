import { AdminGate } from "@/entities/access";
import { PermGate } from "@/pages/admin-hrm";
import AnalyticsPage from "@/pages/admin-hrm/AnalyticsPage";

export default function Screen() {
  return (
    <AdminGate id="internal">
      <PermGate area="analytics">
        <AnalyticsPage />
      </PermGate>
    </AdminGate>
  );
}
