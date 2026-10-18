import { AdminGate } from "@/entities/access";
import AdminStudioPage from "@/pages/admin-studio/AdminStudioPage";

export default function Screen() {
  return (
    <AdminGate id="studio">
      <AdminStudioPage />
    </AdminGate>
  );
}
