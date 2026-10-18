import { RoleGate } from "@/entities/access";
import ProAvailabilityPage from "@/pages/pro-availability/ProAvailabilityPage";

export default function Screen() {
  return (
    <RoleGate roles={["seller"]}>
      <ProAvailabilityPage />
    </RoleGate>
  );
}
