import { RoleGate } from "@/entities/access";
import PromotionsPage from "@/pages/promotions/PromotionsPage";

export default function Screen() {
  return (
    <RoleGate roles={["seller"]}>
      <PromotionsPage />
    </RoleGate>
  );
}
