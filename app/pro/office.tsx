import { RoleGate } from "@/entities/access";
import { OfficePage } from "@/pages/pro-office/OfficePage";

export default function Screen() {
  return (
    <RoleGate roles={["seller"]}>
      <OfficePage />
    </RoleGate>
  );
}
