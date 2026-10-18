import { AdminGate } from "@/entities/access";
import { PermGate } from "@/pages/admin-hrm";
import SchedulesPage from "@/pages/admin-hrm/SchedulesPage";

export default function Screen() {
  return (
    <AdminGate id="internal">
      <PermGate area="schedules">
        <SchedulesPage />
      </PermGate>
    </AdminGate>
  );
}
