import { useQuery, useQueryClient } from "@tanstack/react-query";
import { docKeys, getEditor } from "@/entities/doc-queue";

// GET …/editor. Fetched once per open (never refetched in the background): a new
// object would rebuild the WebView and tear down the document the advocate is typing in.
export function useEditorSession(id: string, enabled: boolean) {
  const qc = useQueryClient();
  const query = useQuery({ queryKey: docKeys.editor(id), queryFn: () => getEditor(id), enabled, staleTime: Infinity, gcTime: 0, retry: false });
  // Re-open after a source change or a failure.
  const reopen = () => void qc.resetQueries({ queryKey: docKeys.editor(id) });
  return { ...query, reopen };
}
