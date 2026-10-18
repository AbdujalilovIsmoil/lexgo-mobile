import { AdminGate } from "@/entities/access";
import AdminNotifyPage from "@/pages/admin-notify/AdminNotifyPage";

export default function Screen() {
  return (
    <AdminGate id="notifications">
      <AdminNotifyPage />
    </AdminGate>
  );
}
