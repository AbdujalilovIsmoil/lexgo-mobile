import { AdminGate } from "@/entities/access";
import StudioObjectPage from "@/pages/admin-studio/StudioObjectPage";

export default function Screen() {
  return (
    <AdminGate id="studio">
      <StudioObjectPage />
    </AdminGate>
  );
}
