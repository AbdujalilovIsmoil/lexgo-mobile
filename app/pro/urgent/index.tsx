import { RoleGate } from "@/entities/access";
import ProUrgentPage from "@/pages/urgent/ProUrgentPage";

// Advocates / lawyers (and call-center lawyers, who may also take from the open pool).
export default function Screen() {
  return (
    <RoleGate roles={["seller", "callCenterLawyer"]}>
      <ProUrgentPage />
    </RoleGate>
  );
}
