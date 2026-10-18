import { AdminGate } from "@/entities/access";
import { PermGate } from "@/pages/admin-hrm";
import MyAttendancePage from "@/pages/admin-hrm/MyAttendancePage";

export default function Screen() {
  return (
    <AdminGate id="internal">
      <PermGate area="attendance">
        <MyAttendancePage />
      </PermGate>
    </AdminGate>
  );
}
