import { RoleGate } from "@/entities/access";
import ProStatsPage from "@/pages/pro-stats/ProStatsPage";

export default function Screen() {
  return (
    <RoleGate roles={["seller"]}>
      <ProStatsPage />
    </RoleGate>
  );
}
