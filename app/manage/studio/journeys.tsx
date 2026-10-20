import { AdminGate } from "@/entities/access";
import StudioJourneysPage from "@/pages/admin-studio/StudioJourneysPage";

export default function Screen() {
  return (
    <AdminGate id="studio">
      <StudioJourneysPage />
    </AdminGate>
  );
}
