import { RoleGate } from "@/entities/access";
import { SosPage } from "@/pages/sos/SosPage";

// Emergency legal help is a client flow; advocates and staff have /pro/urgent and /cc/urgent.
export default function Screen() {
  return (
    <RoleGate roles={["client"]}>
      <SosPage />
    </RoleGate>
  );
}
