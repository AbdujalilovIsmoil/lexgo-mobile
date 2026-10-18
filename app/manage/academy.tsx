import { AdminGate } from "@/entities/access";
import AdminAcademyPage from "@/pages/admin-academy/AdminAcademyPage";

export default function Screen() {
  return (
    <AdminGate id="academy">
      <AdminAcademyPage />
    </AdminGate>
  );
}
