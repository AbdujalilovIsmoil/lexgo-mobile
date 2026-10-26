import { RoleGate } from "@/entities/access";
import ProAssistantPage from "@/pages/pro-assistant/ProAssistantPage";

export default function Screen() {
  return (
    <RoleGate roles={["seller"]}>
      <ProAssistantPage />
    </RoleGate>
  );
}
