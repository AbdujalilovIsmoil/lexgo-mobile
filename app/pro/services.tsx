import { RoleGate } from "@/entities/access";
import ProServicesPage from "@/pages/pro-services/ProServicesPage";

export default function Screen() {
  return (
    <RoleGate roles={["seller"]}>
      <ProServicesPage />
    </RoleGate>
  );
}
