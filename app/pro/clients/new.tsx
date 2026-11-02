import { RoleGate } from "@/entities/access";
import { NewClientPage } from "@/pages/pro-clients/NewClientPage";

export default function Screen() {
  return (
    <RoleGate roles={["seller"]}>
      <NewClientPage />
    </RoleGate>
  );
}
