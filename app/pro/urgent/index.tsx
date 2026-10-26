import { RoleGate } from "@/entities/access";
import ProUrgentPage from "@/pages/urgent/ProUrgentPage";

export default function Screen() {
  return (
    <RoleGate roles={["seller"]}>
      <ProUrgentPage />
    </RoleGate>
  );
}
