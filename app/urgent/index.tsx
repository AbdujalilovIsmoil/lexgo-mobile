import { RoleGate } from "@/entities/access";
import UrgentPage from "@/pages/urgent/UrgentPage";

// Clients order Tezkor advokat; advocates and call-center staff have their own areas (/pro/urgent, /cc/urgent).
export default function Screen() {
  return (
    <RoleGate roles={["client"]}>
      <UrgentPage />
    </RoleGate>
  );
}
