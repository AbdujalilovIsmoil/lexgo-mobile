import { RoleGate } from "@/entities/access";
import ProCasesPage from "@/pages/pro-cases/ProCasesPage";

export default function Screen() {
  return (
    <RoleGate roles={["seller"]}>
      <ProCasesPage />
    </RoleGate>
  );
}
