import { RoleGate } from "@/entities/access";
import PromotionNewPage from "@/pages/promotions/PromotionNewPage";

export default function Screen() {
  return (
    <RoleGate roles={["seller"]}>
      <PromotionNewPage />
    </RoleGate>
  );
}
