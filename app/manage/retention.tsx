import { AdminGate } from "@/entities/access";
import AdminRetentionPage from "@/pages/admin-retention/AdminRetentionPage";

export default function Screen() {
  return (
    <AdminGate id="retention">
      <AdminRetentionPage />
    </AdminGate>
  );
}
