import { RoleGate } from "@/entities/access";
import ProCalendarPage from "@/pages/pro-calendar/ProCalendarPage";

export default function Screen() {
  return (
    <RoleGate roles={["seller"]}>
      <ProCalendarPage />
    </RoleGate>
  );
}
