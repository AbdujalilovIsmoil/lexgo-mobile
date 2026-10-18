import { useLocalSearchParams } from "expo-router";
import { RoleGate } from "@/entities/access";
import DutyRequestPage from "@/pages/duty-request/DutyRequestPage";

// /services/<serviceId>/lawyer — request the duty advocate for this document service (TZ 14).
export default function Screen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <RoleGate roles={["any"]}>
      <DutyRequestPage kind="service" serviceId={id} />
    </RoleGate>
  );
}
