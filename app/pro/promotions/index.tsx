import { RoleGate } from "@/entities/access";
import PromotionsPage from "@/pages/promotions/PromotionsPage";
import { DigitalOnly } from "@/shared/store-rules/DigitalOnly";

export default function Screen() {
  return (
    <RoleGate roles={["seller"]}>
      <DigitalOnly><PromotionsPage /></DigitalOnly>
    </RoleGate>
  );
}
