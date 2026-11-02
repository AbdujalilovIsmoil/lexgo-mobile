import { RoleGate } from "@/entities/access";
import PromotionNewPage from "@/pages/promotions/PromotionNewPage";
import { DigitalOnly } from "@/shared/store-rules/DigitalOnly";

export default function Screen() {
  return (
    <RoleGate roles={["seller"]}>
      <DigitalOnly><PromotionNewPage /></DigitalOnly>
    </RoleGate>
  );
}
