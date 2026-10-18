import { AdminGate } from "@/entities/access";
import AdminAiRegPage from "@/pages/admin-aireg/AdminAiRegPage";

export default function Screen() {
  return (
    <AdminGate id="aiReglaments">
      <AdminAiRegPage />
    </AdminGate>
  );
}
