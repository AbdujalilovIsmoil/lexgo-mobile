import { AdminGate } from "@/entities/access";
import { PermGate } from "@/pages/admin-hrm";
import MyTasksPage from "@/pages/admin-hrm/MyTasksPage";

export default function Screen() {
  return (
    <AdminGate id="internal">
      <PermGate area="tasks">
        <MyTasksPage />
      </PermGate>
    </AdminGate>
  );
}
