import { AdminGate } from "@/entities/access";
import AdminComplaintsPage from "@/pages/admin-complaints/AdminComplaintsPage";

export default function Screen() {
  return (
    <AdminGate id="complaints">
      <AdminComplaintsPage />
    </AdminGate>
  );
}
