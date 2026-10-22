import { draftKey, useDraftStore } from "@/entities/doc-form";
import { useTemplateDetail } from "@/entities/doc-template";
import { blockedBy, type ExistingRef } from "@/entities/duty-request";
import { useDoc } from "@/entities/my-document";
import { useSession } from "@/entities/session";
import { useOpenRequest } from "./useOpenRequest";

export type TemplateCtx = { id: string; title: string; category: string; language: string; resumeDocId: string; draftAnswers: Record<string, string> | undefined };

// What the lawyer request of a template needs to know: the template (title, category), the constructor draft of this person (its answers and the
// document request it started), and whether an advocate request is already open for it — read from the light list and from the started request's own
// flags (`can_send_lawyer_request`), so a blocked one is never offered a second send.
export function useTemplateLawyer(templateId: string): { ctx: TemplateCtx; blocked: ExistingRef | null; loading: boolean } {
  const user = useSession()?.user.id ?? "";
  const detail = useTemplateDetail(templateId);
  const draft = useDraftStore((s) => s.drafts[draftKey(user, "tpl", templateId)]);
  const doc = useDoc(draft?.requestId ?? "");
  const open = useOpenRequest(templateId);
  const tpl = detail.data;
  const answers = draft && Object.values(draft.answers).some((v) => v.trim()) ? draft.answers : undefined;
  return {
    ctx: { id: templateId, title: tpl?.name ?? "", category: tpl?.category ?? "", language: tpl?.language ?? "", resumeDocId: draft?.requestId ?? "", draftAnswers: answers },
    blocked: open ?? blockedBy(doc.data),
    loading: detail.isLoading,
  };
}
