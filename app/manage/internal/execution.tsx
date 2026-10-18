import { AdminGate } from "@/entities/access";
import { PermGate } from "@/pages/admin-hrm";
import ExecutionPage from "@/pages/admin-hrm/ExecutionPage";

export default function Screen() {
  return (
    <AdminGate id="internal">
      <PermGate area="execution">
        <ExecutionPage />
      </PermGate>
    </AdminGate>
  );
}
