import { AdminGate } from "@/entities/access";
import AdminPayoutsPage from "@/pages/admin-payouts/AdminPayoutsPage";

export default function Screen() {
  return (
    <AdminGate id="payouts">
      <AdminPayoutsPage />
    </AdminGate>
  );
}
