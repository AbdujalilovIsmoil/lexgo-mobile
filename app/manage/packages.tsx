import { AdminGate } from "@/entities/access";
import AdminPackagesPage from "@/pages/admin-packages/AdminPackagesPage";

export default function Screen() {
  return (
    <AdminGate id="packages">
      <AdminPackagesPage />
    </AdminGate>
  );
}
