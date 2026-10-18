import { AdminGate } from "@/entities/access";
import AdminB2bPage from "@/pages/admin-b2b/AdminB2bPage";

export default function Screen() {
  return (
    <AdminGate id="b2b">
      <AdminB2bPage />
    </AdminGate>
  );
}
