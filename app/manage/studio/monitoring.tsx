import { AdminGate } from "@/entities/access";
import StudioMonitoringPage from "@/pages/admin-studio/StudioMonitoringPage";

export default function Screen() {
  return (
    <AdminGate id="studio">
      <StudioMonitoringPage />
    </AdminGate>
  );
}
