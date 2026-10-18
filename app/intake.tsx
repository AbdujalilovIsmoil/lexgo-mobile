import { RoleGate } from "@/entities/access";
import { IntakePage } from "@/pages/intake/IntakePage";

// "Sun'iy intellekt muammo tahlili" — a client-only screen (POST /ai/classify).
export default function Screen() {
  return (
    <RoleGate roles={["client"]}>
      <IntakePage />
    </RoleGate>
  );
}
