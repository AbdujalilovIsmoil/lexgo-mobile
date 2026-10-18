import { AdminGate } from "@/entities/access";
import AdminAdsPage from "@/pages/admin-ads/AdminAdsPage";

export default function Screen() {
  return (
    <AdminGate id="ads">
      <AdminAdsPage />
    </AdminGate>
  );
}
