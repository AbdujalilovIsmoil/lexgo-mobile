import { RoleGate } from "@/entities/access";
import CcComplaintsPage from "@/pages/cc-complaints/CcComplaintsPage";

export default function Screen() {
  return (
    <RoleGate roles={["callCenter", "staff"]}>
      <CcComplaintsPage />
    </RoleGate>
  );
}
