import { RoleGate } from "@/entities/access";
import ProPackagesPage from "@/pages/pro-packages/ProPackagesPage";

export default function Screen() {
  return (
    <RoleGate roles={["seller"]}>
      <ProPackagesPage />
    </RoleGate>
  );
}
