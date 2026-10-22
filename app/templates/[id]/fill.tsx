import { useLocalSearchParams } from "expo-router";
import { TemplateFillPage } from "@/pages/template-fill/TemplateFillPage";

// /templates/<templateId>/fill[?request=<document_request_id>] — fill a ready document yourself (a template with no linked service).
export default function Page() {
  const { id, request } = useLocalSearchParams<{ id: string; request?: string }>();
  return <TemplateFillPage templateId={String(id)} requestId={request ? String(request) : undefined} />;
}
