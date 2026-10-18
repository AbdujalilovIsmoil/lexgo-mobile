import { AdminGate } from "@/entities/access";
import { PermGate } from "@/pages/admin-hrm";
import ProfilePage from "@/pages/admin-hrm/ProfilePage";

export default function Screen() {
  return (
    <AdminGate id="internal">
      <PermGate area="me">
        <ProfilePage />
      </PermGate>
    </AdminGate>
  );
}
