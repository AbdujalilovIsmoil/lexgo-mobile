import { RoleGate } from "@/entities/access";
import UrgentMinePage from "@/pages/urgent/UrgentMinePage";

// The client's own Tezkor advokat requests (sidebar: "Mening so'rovlarim").
export default function Screen() {
  return (
    <RoleGate roles={["client"]}>
      <UrgentMinePage />
    </RoleGate>
  );
}
