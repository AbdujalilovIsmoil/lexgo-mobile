import { AdminGate } from "@/entities/access";
import { PermGate } from "@/pages/admin-hrm";
import TimePage from "@/pages/admin-hrm/TimePage";

export default function Screen() {
  return (
    <AdminGate id="internal">
      <PermGate area="time">
        <TimePage />
      </PermGate>
    </AdminGate>
  );
}
