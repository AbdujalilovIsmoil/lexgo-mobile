import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { ApiError } from "@/shared/api";
import { useT } from "@/shared/i18n";
import { cleanSourcePath, getDocSchema, previewDoc } from "../api/docFormApi";
import { renderTemplate } from "../api/templateRenderApi";
import type { FillSource } from "./fillSource";

export const docFormKeys = {
  schema: (id: string, locale: string) => ["doc-schema", id, locale] as const,
  template: (id: string) => ["doc-template", id] as const,
  preview: (id: string, body: string) => ["doc-preview", id, body] as const,
};

// The section schema of a service; a service without a template answers 404.
export function useDocSchema(serviceId: string) {
  const { t, locale } = useT();
  return useQuery({
    queryKey: docFormKeys.schema(serviceId, locale),
    queryFn: () => getDocSchema(serviceId, t("dc2.extraSection")),
    enabled: !!serviceId,
    staleTime: 10 * 60 * 1000,
    retry: (n, e) => n < 1 && !(e instanceof ApiError && [402, 403, 404].includes(e.status)),
  });
}

// Server-rendered preview of the current answers; refetches when they change.
export function usePreview(serviceId: string, answers: Record<string, string>, enabled: boolean) {
  const body = JSON.stringify(answers);
  return useQuery({
    queryKey: docFormKeys.preview(serviceId, body),
    queryFn: () => previewDoc(serviceId, answers),
    enabled: enabled && !!serviceId,
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
  });
}

export { cleanSourcePath };

// A template's server preview with no answers (the document as a reader sees it) and its section schema. Public, so a guest can read it.
export function useTemplateRender(templateId: string) {
  const { t, locale } = useT();
  return useQuery({
    queryKey: ["doc-template-render", templateId, locale] as const,
    queryFn: () => renderTemplate(templateId, {}, t("dc2.extraSection")),
    enabled: !!templateId,
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });
}

// Server preview of a fill source (a service or a document request); same refetch-on-change behaviour as `usePreview`.
export function usePreviewOf(source: FillSource, answers: Record<string, string>, enabled: boolean) {
  const body = JSON.stringify(answers);
  return useQuery({
    queryKey: docFormKeys.preview(source.previewKey, body),
    queryFn: () => source.preview(answers),
    enabled,
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
  });
}
