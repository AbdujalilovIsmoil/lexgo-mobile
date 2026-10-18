import { RoleGate } from "@/entities/access";
import CcClientPage from "@/pages/cc-client/CcClientPage";

export default function Screen() {
  return (
    <RoleGate roles={["callCenter", "staff"]}>
      <CcClientPage />
    </RoleGate>
  );
}
