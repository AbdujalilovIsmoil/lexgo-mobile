import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getTemplateSource, isPlanRequired } from "@/entities/service";
import { kindOf, useDownload } from "@/shared/lib/download";

const DOCX = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

// The blank sample of a service: its file facts (GET document-fields), then the clean file itself.
// `plan` carries the server's sentence when the client's plan has no template access (402).
export function useSampleFile(serviceId: string) {
  const meta = useQuery({ queryKey: ["service-sample", serviceId], queryFn: () => getTemplateSource(serviceId), enabled: !!serviceId, retry: false, staleTime: 5 * 60 * 1000 });
  const file = useDownload();
  const src = meta.data?.hasFile ? meta.data : null;
  const name = src ? src.name || `${src.title || "document"}.docx` : "";
  const mime = src?.mime || DOCX;
  useEffect(() => {
    if (src) void file.start({ path: src.path, name, mime });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src?.path]);
  const plan = isPlanRequired(meta.error) ? meta.error.detail ?? "" : null;
  return {
    title: meta.data?.title ?? "",
    plan,
    empty: !!meta.data && !src,
    failed: (meta.isError && plan === null) || file.state.phase === "error",
    loading: meta.isPending || (!!src && file.state.phase !== "done" && file.state.phase !== "error"),
    uri: file.state.uri ?? null,
    kind: kindOf(name, mime),
    name,
    mime,
    retry: () => (meta.isError ? void meta.refetch() : src && void file.start({ path: src.path, name, mime })),
  };
}
