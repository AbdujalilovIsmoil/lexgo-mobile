import { AdminGate } from "@/entities/access";
import { PermGate } from "@/pages/admin-hrm";
import OrgPage from "@/pages/admin-hrm/OrgPage";

export default function Screen() {
  return (
    <AdminGate id="internal">
      <PermGate area="org">
        <OrgPage />
      </PermGate>
    </AdminGate>
  );
}
