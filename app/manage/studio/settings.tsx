import { AdminGate } from "@/entities/access";
import StudioSettingsPage from "@/pages/admin-studio/StudioSettingsPage";

export default function Screen() {
  return (
    <AdminGate id="studio">
      <StudioSettingsPage />
    </AdminGate>
  );
}
