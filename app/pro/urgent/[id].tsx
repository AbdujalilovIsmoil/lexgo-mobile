import { RoleGate } from "@/entities/access";
import { ProDetailPage } from "@/pages/urgent/UrgentDetailPage";

export default function Screen() {
  return (
    <RoleGate roles={["seller"]}>
      <ProDetailPage />
    </RoleGate>
  );
}
