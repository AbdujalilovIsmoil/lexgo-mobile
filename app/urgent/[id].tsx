import { RoleGate } from "@/entities/access";
import { ClientDetailPage } from "@/pages/urgent/UrgentDetailPage";

// Any signed-in user may land here from a notification; the page picks the right view for their role.
export default function Screen() {
  return (
    <RoleGate roles={["any"]}>
      <ClientDetailPage />
    </RoleGate>
  );
}
