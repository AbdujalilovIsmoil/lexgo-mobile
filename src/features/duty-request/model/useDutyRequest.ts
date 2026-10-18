import { useT } from "@/shared/i18n";
import type { DutyKind } from "@/entities/duty-request";
import { useAttachments } from "./useAttachments";
import { useDutyFields } from "./useDutyFields";
import { useDutySubmit } from "./useDutySubmit";

// The whole request form: fields, attachments, validation gate and sending.
export function useDutyRequest(kind: DutyKind, serviceId?: string) {
  const { t } = useT();
  const f = useDutyFields(kind);
  const att = useAttachments();
  const sub = useDutySubmit();
  const submit = async () => {
    if (!(await f.check()) || sub.pending) return;
    sub.send({
      kind,
      serviceId,
      need: f.needText(),
      title: kind === "service" ? undefined : f.title.trim() || undefined,
      language: f.lang,
      requestedType: f.docType || undefined,
      // The consent is recorded with the request (answers_json) — neither endpoint has a field of its own.
      answers: { contact_consent: true, contact_consent_text: t("dm8.consentLabel") },
      mainFile: f.mainFile ?? undefined,
      files: att.files,
      voices: att.voices,
    });
  };
  return { f, att, sub, submit };
}
