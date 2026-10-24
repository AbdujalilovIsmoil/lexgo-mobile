import { RoleGate } from "@/entities/access";
import { ExperiencePage } from "@/pages/pro-experience/ExperiencePage";

export default function Screen() {
  return (
    <RoleGate roles={["seller"]}>
      <ExperiencePage />
    </RoleGate>
  );
}
