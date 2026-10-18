import { AdminGate } from "@/entities/access";
import HubPage from "@/pages/admin-hrm/HubPage";

export default function HrmTab() {
  return (
    <AdminGate id="internal">
      <HubPage tab />
    </AdminGate>
  );
}
