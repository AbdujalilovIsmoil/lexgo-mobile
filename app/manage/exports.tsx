import { AdminGate } from "@/entities/access";
import AdminExportsPage from "@/pages/admin-exports/AdminExportsPage";

export default function Screen() {
  return (
    <AdminGate id="exports">
      <AdminExportsPage />
    </AdminGate>
  );
}
