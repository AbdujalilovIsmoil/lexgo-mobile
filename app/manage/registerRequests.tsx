import { AdminGate } from "@/entities/access";
import AdminRegPage from "@/pages/admin-reg/AdminRegPage";

export default function Screen() {
  return (
    <AdminGate id="registerRequests">
      <AdminRegPage />
    </AdminGate>
  );
}
