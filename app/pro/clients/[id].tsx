import { RoleGate } from "@/entities/access";
import { ClientCardPage } from "@/pages/pro-clients/ClientCardPage";

export default function Screen() {
  return (
    <RoleGate roles={["seller"]}>
      <ClientCardPage />
    </RoleGate>
  );
}
