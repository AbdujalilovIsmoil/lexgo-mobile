import { useLocalSearchParams } from "expo-router";
import { DocAiPage } from "@/pages/doc-ai/DocAiPage";

export default function Page() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <DocAiPage id={String(id)} />;
}
