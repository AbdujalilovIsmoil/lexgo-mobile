import { AdminGate } from "@/entities/access";
import { PermGate } from "@/pages/admin-hrm";
import EmployeesPage from "@/pages/admin-hrm/EmployeesPage";

export default function Screen() {
  return (
    <AdminGate id="internal">
      <PermGate area="employees">
        <EmployeesPage />
      </PermGate>
    </AdminGate>
  );
}
