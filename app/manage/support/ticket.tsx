import { AdminGate } from "@/entities/access";
import AdminSupportTicketPage from "@/pages/admin-support/AdminSupportTicketPage";

export default function Screen() {
  return (
    <AdminGate id="support">
      <AdminSupportTicketPage />
    </AdminGate>
  );
}
