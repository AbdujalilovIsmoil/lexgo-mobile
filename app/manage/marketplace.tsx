import { AdminGate } from "@/entities/access";
import AdminMarketplacePage from "@/pages/admin-marketplace/AdminMarketplacePage";

export default function Screen() {
  return (
    <AdminGate id="marketplace">
      <AdminMarketplacePage />
    </AdminGate>
  );
}
