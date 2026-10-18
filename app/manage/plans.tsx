import { AdminGate } from "@/entities/access";
import AdminPlansPage from "@/pages/admin-plans/AdminPlansPage";

export default function Screen() {
  return (
    <AdminGate id="plans">
      <AdminPlansPage />
    </AdminGate>
  );
}
