import { useLocalSearchParams } from "expo-router";
import { TemplateDetailPage } from "@/pages/template-detail/TemplateDetailPage";

// /templates/<templateId> — a ready document of the catalogue.
export default function Page() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <TemplateDetailPage id={String(id)} />;
}
