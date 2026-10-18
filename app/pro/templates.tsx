import { RoleGate } from "@/entities/access";
import ProTemplatesPage from "@/pages/pro-templates/ProTemplatesPage";

export default function Screen() {
  return (
    <RoleGate roles={["seller"]}>
      <ProTemplatesPage />
    </RoleGate>
  );
}
