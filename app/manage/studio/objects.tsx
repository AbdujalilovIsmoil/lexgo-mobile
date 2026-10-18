import { AdminGate } from "@/entities/access";
import StudioObjectsPage from "@/pages/admin-studio/StudioObjectsPage";

export default function Screen() {
  return (
    <AdminGate id="studio">
      <StudioObjectsPage />
    </AdminGate>
  );
}
