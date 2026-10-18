import { AdminGate } from "@/entities/access";
import AdminCallcenterPage from "@/pages/admin-callcenter/AdminCallcenterPage";

export default function Screen() {
  return (
    <AdminGate id="callcenter">
      <AdminCallcenterPage />
    </AdminGate>
  );
}
