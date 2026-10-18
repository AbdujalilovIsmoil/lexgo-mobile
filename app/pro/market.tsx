import { RoleGate } from "@/entities/access";
import ProMarketPage from "@/pages/pro-market/ProMarketPage";

export default function Screen() {
  return (
    <RoleGate roles={["seller"]}>
      <ProMarketPage />
    </RoleGate>
  );
}
