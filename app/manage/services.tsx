import { AdminGate } from "@/entities/access";
import AdminServicesPage from "@/pages/admin-services/AdminServicesPage";

export default function Screen() {
  return (
    <AdminGate id="services">
      <AdminServicesPage />
    </AdminGate>
  );
}
