import { useLocalSearchParams } from "expo-router";
import { RoleGate } from "@/entities/access";
import DutyRequestPage from "@/pages/duty-request/DutyRequestPage";

// /documents/new?kind=custom|review — a document from scratch, or an existing one for the duty advocate to check.
export default function Screen() {
  const { kind } = useLocalSearchParams<{ kind?: string }>();
  return (
    <RoleGate roles={["any"]}>
      <DutyRequestPage kind={kind === "review" ? "review" : "custom"} />
    </RoleGate>
  );
}
