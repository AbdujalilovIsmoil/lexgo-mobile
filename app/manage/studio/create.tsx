import { AdminGate } from "@/entities/access";
import StudioCreatePage from "@/pages/admin-studio/StudioCreatePage";

export default function Screen() {
  return (
    <AdminGate id="studio">
      <StudioCreatePage />
    </AdminGate>
  );
}
