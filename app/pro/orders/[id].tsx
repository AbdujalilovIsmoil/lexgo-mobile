import { RoleGate } from "@/entities/access";
import ProOrderPage from "@/pages/pro-orders/ProOrderPage";

export default function Screen() {
  return (
    <RoleGate roles={["seller"]}>
      <ProOrderPage />
    </RoleGate>
  );
}
