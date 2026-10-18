import { RoleGate } from "@/entities/access";
import DocPoolPage from "@/pages/pro-docs/DocPoolPage";

// The open pool is for call-center lawyers only; ordinary advocates see just what is assigned to them.
export default function Screen() {
  return (
    <RoleGate roles={["callCenterLawyer", "staff"]}>
      <DocPoolPage />
    </RoleGate>
  );
}
