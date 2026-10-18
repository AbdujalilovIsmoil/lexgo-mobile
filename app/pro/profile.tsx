import { RoleGate } from "@/entities/access";
import ProProfilePage from "@/pages/pro-profile/ProProfilePage";

export default function Screen() {
  return (
    <RoleGate roles={["seller"]}>
      <ProProfilePage />
    </RoleGate>
  );
}
