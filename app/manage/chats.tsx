import { AdminGate } from "@/entities/access";
import AdminChatsPage from "@/pages/admin-chats/AdminChatsPage";

export default function Screen() {
  return (
    <AdminGate id="chats">
      <AdminChatsPage />
    </AdminGate>
  );
}
