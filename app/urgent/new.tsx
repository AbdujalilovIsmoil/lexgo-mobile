import { RoleGate } from "@/entities/access";
import UrgentNewPage from "@/pages/urgent/UrgentNewPage";

// Clients order Tezkor advokat; advocates have their own area (/pro/urgent).
export default function Screen() {
  return (
    <RoleGate roles={["client"]}>
      <UrgentNewPage />
    </RoleGate>
  );
}
