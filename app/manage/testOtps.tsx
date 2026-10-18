import { AdminGate } from "@/entities/access";
import AdminOtpPage from "@/pages/admin-otp/AdminOtpPage";

export default function Screen() {
  return (
    <AdminGate id="testOtps">
      <AdminOtpPage />
    </AdminGate>
  );
}
