import { RoleGate } from "@/entities/access";
import UrgentPage from "@/pages/urgent/UrgentPage";

// Clients order Tezkor advokat; advocates have their own area (/pro/urgent).
export default function Screen() {
  return (
    <RoleGate roles={["client"]}>
      <UrgentPage />
    </RoleGate>
  );
}
