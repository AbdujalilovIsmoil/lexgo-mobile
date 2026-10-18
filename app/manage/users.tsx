import { AdminGate } from "@/entities/access";
import AdminUsersPage from "@/pages/admin-users/AdminUsersPage";

export default function Screen() {
  return (
    <AdminGate id="users">
      <AdminUsersPage />
    </AdminGate>
  );
}
