import { AdminGate } from "@/entities/access";
import AdminAidPage from "@/pages/admin-aid/AdminAidPage";

export default function Screen() {
  return (
    <AdminGate id="legalAid">
      <AdminAidPage />
    </AdminGate>
  );
}
