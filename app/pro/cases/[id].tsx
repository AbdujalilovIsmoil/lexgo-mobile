import { RoleGate } from "@/entities/access";
import ProCasePage from "@/pages/pro-case/ProCasePage";

export default function Screen() {
  return (
    <RoleGate roles={["seller"]}>
      <ProCasePage />
    </RoleGate>
  );
}
