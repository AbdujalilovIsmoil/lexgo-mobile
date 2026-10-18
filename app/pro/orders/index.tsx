import { RoleGate } from "@/entities/access";
import ProOrdersPage from "@/pages/pro-orders/ProOrdersPage";

export default function Screen() {
  return (
    <RoleGate roles={["seller"]}>
      <ProOrdersPage />
    </RoleGate>
  );
}
