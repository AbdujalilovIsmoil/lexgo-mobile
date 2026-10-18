import { AdminGate } from "@/entities/access";
import AdminCeoPage from "@/pages/admin-ceo/AdminCeoPage";

export default function Screen() {
  return (
    <AdminGate id="ceo">
      <AdminCeoPage />
    </AdminGate>
  );
}
