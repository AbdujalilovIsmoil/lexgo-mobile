import { RoleGate } from "@/entities/access";
import CcNotifyPage from "@/pages/cc-notify/CcNotifyPage";

// Sending notifications needs notifications.manage (call-center operators hold it; the server stays final).
export default function Screen() {
  return (
    <RoleGate roles={["callCenter", "staff"]} perm="notifications.manage">
      <CcNotifyPage />
    </RoleGate>
  );
}
