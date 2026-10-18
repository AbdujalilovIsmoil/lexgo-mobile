import { RoleGate } from "@/entities/access";
import CcCallsPage from "@/pages/cc-calls/CcCallsPage";

export default function Screen() {
  return (
    <RoleGate roles={["callCenter", "staff"]}>
      <CcCallsPage />
    </RoleGate>
  );
}
