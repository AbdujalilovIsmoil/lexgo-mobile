import { useLocalSearchParams } from "expo-router";
import OrgMemberPage from "@/pages/org/OrgMemberPage";

export default function Screen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <OrgMemberPage memberId={String(id ?? "")} />;
}
