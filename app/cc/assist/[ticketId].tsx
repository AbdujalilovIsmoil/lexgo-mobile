import { RoleGate } from "@/entities/access";
import AdminSupportTicketPage from "@/pages/admin-support/AdminSupportTicketPage";

// Operator workspace of one support ticket: chat, call and "act on behalf of the client" (assist).
export default function Screen() {
  return (
    <RoleGate roles={["callCenter", "staff"]}>
      <AdminSupportTicketPage />
    </RoleGate>
  );
}
