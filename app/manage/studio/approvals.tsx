import { AdminGate } from "@/entities/access";
import StudioApprovalsPage from "@/pages/admin-studio/StudioApprovalsPage";

export default function Screen() {
  return (
    <AdminGate id="studio">
      <StudioApprovalsPage />
    </AdminGate>
  );
}
