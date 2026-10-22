import { useT } from "@/shared/i18n";
import type { DutyKind } from "@/entities/duty-request";
import { useAttachments } from "./useAttachments";
import type { TemplateCtx } from "./useTemplateLawyer";
import { useDutyFields } from "./useDutyFields";
import { useDutySubmit } from "./useDutySubmit";

// The whole request form: fields, attachments, validation gate and sending.
export function useDutyRequest(kind: DutyKind, serviceId?: string, tpl?: TemplateCtx) {
  const { t } = useT();
  const f = useDutyFields(kind);
  const att = useAttachments();
  const sub = useDutySubmit();
  const submit = async () => {
    if (!(await f.check()) || sub.pending) return;
    sub.send({
      kind,
      serviceId,
      // A template's request carries the template's own title and the constructor draft; no files or voice (lawyer-review is JSON only).
      ...(kind === "template" && tpl ? { templateId: tpl.id, resumeDocId: tpl.resumeDocId || undefined, category: tpl.category } : {}),
      need: f.needText(),
      title: kind === "service" ? undefined : kind === "template" ? tpl?.title : f.title.trim() || undefined,
      language: f.lang,
      requestedType: f.docType || undefined,
      // The consent is recorded with the request (answers_json) — neither endpoint has a field of its own.
      // A template's request keeps the document's answers clean: only the constructor draft is saved.
      answers: kind === "template" ? tpl?.draftAnswers : { contact_consent: true, contact_consent_text: t("dm8.consentLabel") },
      mainFile: f.mainFile ?? undefined,
      files: kind === "template" ? [] : att.files,
      voices: kind === "template" ? [] : att.voices,
    });
  };
  return { f, att, sub, submit };
}
