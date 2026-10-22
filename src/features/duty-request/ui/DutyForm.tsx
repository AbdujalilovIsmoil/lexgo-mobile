import type { ReactNode } from "react";
import { View } from "react-native";
import { FormInput } from "@/shared/form";
import { useT } from "@/shared/i18n";
import { Text } from "@/shared/ui";
import { docTypeApplies, DocTypePicker, useDocTypes, type DutyKind } from "@/entities/duty-request";
import type { useDutyFields } from "../model/useDutyFields";
import type { useAttachments } from "../model/useAttachments";
import { AttachmentBar } from "./AttachmentBar";
import { ConsentRow } from "./ConsentRow";
import { DutyHero } from "./DutyHero";
import { LangPicker } from "./LangPicker";
import { MainFilePicker } from "./MainFilePicker";
import { StepCard } from "./StepCard";

type Props = { kind: DutyKind; f: ReturnType<typeof useDutyFields>; att: ReturnType<typeof useAttachments>; busy: boolean; sub?: string };

// The request to the duty advocate as a guided page: a hero with the progress of what is required, then numbered
// steps (document, situation, files and voice, language) and the consent. No advocate is chosen here — the
// request goes to the call-center pool.
export function DutyForm({ kind, f, att, busy, sub }: Props) {
  const { t } = useT();
  const opts = useDocTypes().data;
  const review = kind === "review";
  const tpl = kind === "template"; // a ready template without a service: no title field (the template's own), no files or voice (the endpoint is JSON only)
  const typed = !!opts && docTypeApplies(opts, kind === "custom" ? "custom_from_scratch" : "template_lawyer_assisted");
  const needOk = f.need.trim().length >= 10;
  const done = (review && f.mainFile ? 1 : 0) + (needOk ? 1 : 0) + (f.consent ? 1 : 0);
  const hero = tpl ? { icon: "headphones" as const, title: t("dcl.title"), sub } : review ? { icon: "clipboard" as const, title: t("csv.newDocReview"), sub: t("csv.newDocReviewSub") } : kind === "custom" ? { icon: "edit-3" as const, title: t("csv.newDocScratch"), sub: t("csv.newDocScratchSub") } : { icon: "briefcase" as const, title: t("dm7.title"), sub };
  let n = 0;
  const step = (title: string, body: ReactNode, o: { done?: boolean; error?: boolean; caption?: string } = {}) => (
    <StepCard n={++n} title={title} caption={o.caption} done={o.done} error={o.error} attempt={f.attempt}>{body}</StepCard>
  );
  return (
    <>
      <DutyHero icon={hero.icon} title={hero.title} sub={hero.sub} done={done} total={review ? 3 : 2} />
      {review ? <MainFilePicker file={f.mainFile} onPick={f.setMainFile} error={f.missing === "mainFile"} /> : null}
      {!review && (typed || (kind !== "service" && !tpl))
        ? step(typed ? t("dm7.typeLabel") : t("dm7.titleLabel"), (
          <View style={{ gap: 14 }}>
            {typed ? <DocTypePicker label={false} flow={kind === "custom" ? "custom_from_scratch" : "template_lawyer_assisted"} value={f.docType} onChange={f.setDocType} /> : null}
            {kind !== "service" && !tpl ? <FormInput control={f.control} name="title" label={typed ? t("dm7.titleLabel") : undefined} editable={!busy} placeholder={t("dm7.titlePh")} maxLength={120} /> : null}
          </View>
        ), { done: !!f.docType || !!f.title.trim() })
        : null}
      {step(t("dm7.needLabel"), (
        <View style={{ gap: 12 }}>
          <FormInput control={f.control} name="need" multiline editable={!busy} placeholder={t("dm7.needPh")} style={{ minHeight: 132, textAlignVertical: "top" }} />
          <Text variant="caption" tone="gray2" style={{ alignSelf: "flex-end", marginTop: -6 }}>{f.need.length}/5000</Text>
          {tpl ? <Text variant="caption" tone="gray">{t("dcl.guide")}</Text> : null}
          <FormInput control={f.control} name="extra" label={t("dm7.noteLabel")} multiline editable={!busy} placeholder={t("dm7.notePh")} style={{ minHeight: 64, textAlignVertical: "top" }} />
        </View>
      ), { done: needOk, error: f.missing === "need" })}
      {tpl ? null : step(t("dm7.extrasLabel"), <AttachmentBar att={att} disabled={busy} />, { done: att.files.length + att.voices.length > 0 })}
      {step(t("dm7.langLabel"), <LangPicker value={f.lang} onChange={f.setLang} />)}
      <ConsentRow value={f.consent} onChange={f.setConsent} error={f.missing === "consent"} attempt={f.attempt} />
    </>
  );
}
