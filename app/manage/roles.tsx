import { AdminGate } from "@/entities/access";
import AdminRolesPage from "@/pages/admin-roles/AdminRolesPage";

export default function Screen() {
  return (
    <AdminGate id="roles">
      <AdminRolesPage />
    </AdminGate>
  );
}
