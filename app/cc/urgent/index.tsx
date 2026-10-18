import { RoleGate } from "@/entities/access";
import CcUrgentPage from "@/pages/urgent/CcUrgentPage";

// The call-center console: operators, call-center lawyers and staff (the backend 403 stays final).
export default function Screen() {
  return (
    <RoleGate roles={["callCenter", "callCenterLawyer", "staff"]}>
      <CcUrgentPage />
    </RoleGate>
  );
}
