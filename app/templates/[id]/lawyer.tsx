import { useLocalSearchParams } from "expo-router";
import { RoleGate } from "@/entities/access";
import DutyRequestPage from "@/pages/duty-request/DutyRequestPage";

// /templates/<templateId>/lawyer — ask the duty advocate to prepare a ready template that has no linked service (README §11.4). Guests sign in first.
export default function Screen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <RoleGate roles={["any"]}>
      <DutyRequestPage kind="template" templateId={String(id)} />
    </RoleGate>
  );
}
