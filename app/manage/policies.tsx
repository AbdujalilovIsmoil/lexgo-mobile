import { AdminGate } from "@/entities/access";
import AdminPoliciesPage from "@/pages/admin-policies/AdminPoliciesPage";

export default function Screen() {
  return (
    <AdminGate id="policies">
      <AdminPoliciesPage />
    </AdminGate>
  );
}
