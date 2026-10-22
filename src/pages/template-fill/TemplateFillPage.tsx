import { useEffect, useMemo, useRef, useState } from "react";
import { draftKey, useDraftsReady, useDraftStore, useTemplateRender, type Draft, type DocSchema } from "@/entities/doc-form";
import { useTemplateDetail } from "@/entities/doc-template";
import type { MyDoc } from "@/entities/my-document";
import { useSession } from "@/entities/session";
import { FillFlow } from "@/features/doc-fill";
import { docToGenerated, mergeAnswers, requestSource, schemaFromDoc, serverAnswers } from "@/features/doc-fill/model/requestSource";
import { useTemplateRequest } from "@/features/doc-fill/model/useTemplateRequest";
import { FlowFailure, FlowLoading, LoginGate } from "@/widgets/doc-flow";
import { trackDoc } from "@/shared/analytics";
import { useT } from "@/shared/i18n";

type Props = { templateId: string; requestId?: string };

// /templates/[id]/fill — the constructor of a template with no linked service (README §7): sign in → the template and its sections → the document
// request (resumed or started) → the same section wizard as a catalogue service, saved to the server as the person types.
// `requestId` (?request=) resumes one particular request, e.g. after "Yes, I will also fill it in" on a lawyer request.
export function TemplateFillPage({ templateId, requestId }: Props) {
  const { t } = useT();
  const user = useSession()?.user.id ?? "";
  const detail = useTemplateDetail(templateId);
  const render = useTemplateRender(templateId);
  const ready = useDraftsReady();
  const title = detail.data?.name || render.data?.schema.title || t("dcf.title");
  if (!user) return <LoginGate title={title} />;
  if (detail.error && !detail.data) return <FlowFailure title={title} error={detail.error} onRetry={() => void detail.refetch()} />;
  if (!ready || detail.isLoading || render.isLoading) return <FlowLoading title={title} />;
  return <Resolve templateId={templateId} requestId={requestId} user={user} title={title} category={detail.data?.category} language={detail.data?.language ?? render.data?.language} sections={render.data?.schema ?? null} />;
}

type Common = { templateId: string; user: string; title: string; category?: string; language?: string; sections: DocSchema | null };

// Mounted once the template and the drafts are in: finds or starts the request, then builds the wizard from it.
function Resolve({ requestId, ...c }: Common & { requestId?: string }) {
  const [draft] = useState(() => useDraftStore.getState().drafts[draftKey(c.user, "tpl", c.templateId)]);
  const r = useTemplateRequest({ templateId: c.templateId, title: c.title, userId: c.user, explicit: requestId, draft, ready: true });
  if (r.error && !r.doc) return <FlowFailure title={c.title} error={r.error} onRetry={r.retry} />;
  if (!r.doc) return <FlowLoading title={c.title} />;
  return <Restored {...c} doc={r.doc} draft={draft} />;
}

// Everything is loaded: schema (the template's own sections, else the request's questionnaire), answers (server + the newer local draft), source.
function Restored({ doc, draft, templateId, user, title, category, language, sections }: Common & { doc: MyDoc; draft?: Draft }) {
  const { t } = useT();
  const schema = useMemo(() => {
    const s = sections && sections.sections.length ? sections : schemaFromDoc(doc, { templateId, title, extraTitle: t("dc2.extraSection") });
    return { ...s, title: s.title || title };
  }, [sections, doc, templateId, title, t]);
  const fields = useMemo(() => schema.sections.flatMap((s) => s.fields), [schema]);
  // Read once at mount: the draft counts when it was typed for this very request (or before any request was recorded); else the server's answers rule.
  const [init] = useState(() => {
    const server = serverAnswers(doc, fields);
    const mine = draft && (!draft.requestId || draft.requestId === doc.id) ? draft : undefined;
    const merged: Draft = { answers: mergeAnswers(server, mine?.answers), step: mine?.step ?? 0, requestId: doc.id, at: mine?.at ?? Date.now() };
    return { server, draft: merged };
  });
  const source = useMemo(() => requestSource({ requestId: doc.id, templateId, fields, answers: init.server, meta: { category, language } }), [doc.id, templateId, fields, init.server, category, language]);
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    trackDoc("document_constructor_started", { category, language, mode: "self", status: doc.status });
  }, [category, language, doc.status]);
  const done = doc.file ? docToGenerated(doc) : null; // already generated: show the file, not the form
  return <FillFlow source={source} userId={user} schema={schema} draft={init.draft} initialDoc={done} />;
}
