import { AdminGate } from "@/entities/access";
import AdminDashPage from "@/pages/admin-dash/AdminDashPage";

export default function Screen() {
  return (
    <AdminGate id="dash">
      <AdminDashPage />
    </AdminGate>
  );
}
