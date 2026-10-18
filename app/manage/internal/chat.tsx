import { AdminGate } from "@/entities/access";
import { PermGate } from "@/pages/admin-hrm";
import ChatPage from "@/pages/admin-hrm/ChatPage";

export default function Screen() {
  return (
    <AdminGate id="internal">
      <PermGate area="messages">
        <ChatPage />
      </PermGate>
    </AdminGate>
  );
}
