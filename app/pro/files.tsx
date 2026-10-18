import { RoleGate } from "@/entities/access";
import ProFilesPage from "@/pages/pro-files/ProFilesPage";

export default function Screen() {
  return (
    <RoleGate roles={["seller"]}>
      <ProFilesPage />
    </RoleGate>
  );
}
