import { RoleGate } from "@/entities/access";
import { CcDetailPage } from "@/pages/urgent/UrgentDetailPage";

export default function Screen() {
  return (
    <RoleGate roles={["callCenter", "callCenterLawyer", "staff"]}>
      <CcDetailPage />
    </RoleGate>
  );
}
