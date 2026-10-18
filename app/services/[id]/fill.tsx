import { useLocalSearchParams } from "expo-router";
import { DocFillPage } from "@/pages/doc-fill/DocFillPage";

export default function Page() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <DocFillPage id={String(id)} />;
}
