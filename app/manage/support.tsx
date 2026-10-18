import { AdminGate } from "@/entities/access";
import AdminSupportPage from "@/pages/admin-support/AdminSupportPage";

export default function Screen() {
  return (
    <AdminGate id="support">
      <AdminSupportPage />
    </AdminGate>
  );
}
