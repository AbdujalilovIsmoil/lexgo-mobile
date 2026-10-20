import { AdminGate } from "@/entities/access";
import StudioJourneyPage from "@/pages/admin-studio/StudioJourneyPage";

export default function Screen() {
  return (
    <AdminGate id="studio">
      <StudioJourneyPage />
    </AdminGate>
  );
}
