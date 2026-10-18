import { RoleGate } from "@/entities/access";
import ProScanPage from "@/pages/pro-scan/ProScanPage";

export default function Screen() {
  return (
    <RoleGate roles={["seller"]}>
      <ProScanPage />
    </RoleGate>
  );
}
