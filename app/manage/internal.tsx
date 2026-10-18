import { AdminGate } from "@/entities/access";
import HubPage from "@/pages/admin-hrm/HubPage";

export default function Screen() {
  return (
    <AdminGate id="internal">
      <HubPage />
    </AdminGate>
  );
}
