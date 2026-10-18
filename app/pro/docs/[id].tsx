import { RoleGate } from "@/entities/access";
import DocDetailPage from "@/pages/pro-docs/DocDetailPage";

export default function Screen() {
  return (
    <RoleGate roles={["seller", "callCenterLawyer", "staff"]}>
      <DocDetailPage />
    </RoleGate>
  );
}
