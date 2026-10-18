import { AdminGate } from "@/entities/access";
import AdminLegalPage from "@/pages/admin-legal/AdminLegalPage";

export default function Screen() {
  return (
    <AdminGate id="legal">
      <AdminLegalPage />
    </AdminGate>
  );
}
