import { RoleGate } from "@/entities/access";
import ProTasksPage from "@/pages/pro-tasks/ProTasksPage";

export default function Screen() {
  return (
    <RoleGate roles={["seller"]}>
      <ProTasksPage />
    </RoleGate>
  );
}
