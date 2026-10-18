import { AdminGate } from "@/entities/access";
import AdminLeadsPage from "@/pages/admin-leads/AdminLeadsPage";

export default function Screen() {
  return (
    <AdminGate id="pipeline">
      <AdminLeadsPage />
    </AdminGate>
  );
}
