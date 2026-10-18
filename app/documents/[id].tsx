import { useLocalSearchParams } from "expo-router";
import { RoleGate } from "@/entities/access";
import DocumentDetailPage from "@/pages/my-documents/DocumentDetailPage";

// /documents/<requestId> — one document of "Mening hujjatlarim" (versions, answers, file, chat…).
export default function Screen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <RoleGate roles={["any"]}>
      <DocumentDetailPage id={id} />
    </RoleGate>
  );
}
