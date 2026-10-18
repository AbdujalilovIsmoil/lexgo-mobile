import { AdminGate } from "@/entities/access";
import { PermGate } from "@/pages/admin-hrm";
import MyMessagesPage from "@/pages/admin-hrm/MyMessagesPage";

export default function Screen() {
  return (
    <AdminGate id="internal">
      <PermGate area="messages">
        <MyMessagesPage />
      </PermGate>
    </AdminGate>
  );
}
