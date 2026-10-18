import { useQuery } from "@tanstack/react-query";
import { useAdminMutation } from "@/shared/lib/useAdminMutation";
import { createTemplate, deleteTemplate, getTemplate, listTemplates, updateTemplate } from "../api/templateApi";
import type { Template, TemplateInput } from "./types";

export const tplKeys = { all: ["admin-templates"] as const };
const inv = [tplKeys.all];

export const useTemplates = () => useQuery({ queryKey: [...tplKeys.all, "list"], queryFn: listTemplates });
// The full template (with its body) for the edit form; falls back to the list row when the GET fails.
export const useTemplateBody = (row: Template | null) =>
  useQuery({ queryKey: [...tplKeys.all, "one", row?.id], queryFn: () => getTemplate(row?.id ?? "").catch(() => row as Template), enabled: !!row, staleTime: 0, gcTime: 0 });

export const useCreateTemplate = () => useAdminMutation({ mutationFn: (b: TemplateInput) => createTemplate(b), invalidate: inv, success: "admTpl.created" });
export const useUpdateTemplate = () => useAdminMutation({ mutationFn: (v: { id: string; body: Partial<TemplateInput> }) => updateTemplate(v.id, v.body), invalidate: inv, success: "admTpl.saved" });
export const useDeleteTemplate = () => useAdminMutation({ mutationFn: (id: string) => deleteTemplate(id), invalidate: inv, success: "admTpl.deleted" });
