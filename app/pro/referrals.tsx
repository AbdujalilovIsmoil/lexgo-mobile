import { RoleGate } from "@/entities/access";
import ProReferralsPage from "@/pages/pro-referrals/ProReferralsPage";

export default function Screen() {
  return (
    <RoleGate roles={["seller"]}>
      <ProReferralsPage />
    </RoleGate>
  );
}
