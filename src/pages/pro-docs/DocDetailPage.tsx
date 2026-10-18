import { useLocalSearchParams } from "expo-router";
import { DocDetailView } from "@/widgets/doc-queue";

// /pro/docs/[id] — one request.
export default function DocDetailPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <DocDetailView id={String(id)} />;
}
