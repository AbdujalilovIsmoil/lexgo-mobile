import { RoleGate } from "@/entities/access";
import ProDocsPage from "@/pages/pro-docs/ProDocsPage";

export default function Screen() {
  return (
    <RoleGate roles={["seller"]}>
      <ProDocsPage />
    </RoleGate>
  );
}
