import { AdminGate } from "@/entities/access";
import AdminUpsellPage from "@/pages/admin-upsell/AdminUpsellPage";

export default function Screen() {
  return (
    <AdminGate id="upsell">
      <AdminUpsellPage />
    </AdminGate>
  );
}
