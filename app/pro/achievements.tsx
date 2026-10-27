import { RoleGate } from "@/entities/access";
import { AchievementsPage } from "@/pages/pro-achievements/AchievementsPage";

export default function Screen() {
  return (
    <RoleGate roles={["seller"]}>
      <AchievementsPage />
    </RoleGate>
  );
}
