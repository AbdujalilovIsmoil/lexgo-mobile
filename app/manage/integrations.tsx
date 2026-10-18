import { AdminGate } from "@/entities/access";
import AdminIntegrationsPage from "@/pages/admin-integrations/AdminIntegrationsPage";

export default function Screen() {
  return (
    <AdminGate id="integrations">
      <AdminIntegrationsPage />
    </AdminGate>
  );
}
