import { AdminGate } from "@/entities/access";
import AdminTemplatesPage from "@/pages/admin-templates/AdminTemplatesPage";

export default function Screen() {
  return (
    <AdminGate id="templates">
      <AdminTemplatesPage />
    </AdminGate>
  );
}
