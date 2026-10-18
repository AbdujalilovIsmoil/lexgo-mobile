import { AdminGate } from "@/entities/access";
import AdminCallsPage from "@/pages/admin-calls/AdminCallsPage";

export default function Screen() {
  return (
    <AdminGate id="callAnalytics">
      <AdminCallsPage />
    </AdminGate>
  );
}
