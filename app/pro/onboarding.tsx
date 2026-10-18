import { RoleGate } from "@/entities/access";
import ProOnboardingPage from "@/pages/pro-onboarding/ProOnboardingPage";

export default function Screen() {
  return (
    <RoleGate roles={["seller"]}>
      <ProOnboardingPage />
    </RoleGate>
  );
}
