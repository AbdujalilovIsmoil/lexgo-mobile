import { RoleGate } from "@/entities/access";
import { SosPage } from "@/pages/sos/SosPage";

// Emergency legal help is a client flow; advocates have /pro/urgent.
export default function Screen() {
  return (
    <RoleGate roles={["client"]}>
      <SosPage />
    </RoleGate>
  );
}
