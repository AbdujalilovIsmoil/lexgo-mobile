import { AdminGate } from "@/entities/access";
import { PermGate } from "@/pages/admin-hrm";
import KpiPage from "@/pages/admin-hrm/KpiPage";

export default function Screen() {
  return (
    <AdminGate id="internal">
      <PermGate area="kpi">
        <KpiPage />
      </PermGate>
    </AdminGate>
  );
}
