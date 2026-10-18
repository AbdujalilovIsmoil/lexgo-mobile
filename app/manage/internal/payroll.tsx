import { AdminGate } from "@/entities/access";
import { PermGate } from "@/pages/admin-hrm";
import PayrollPage from "@/pages/admin-hrm/PayrollPage";

export default function Screen() {
  return (
    <AdminGate id="internal">
      <PermGate area="payroll">
        <PayrollPage />
      </PermGate>
    </AdminGate>
  );
}
