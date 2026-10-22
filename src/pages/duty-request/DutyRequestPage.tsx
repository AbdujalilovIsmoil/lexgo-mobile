import { useEffect, useRef } from "react";
import { useRouter } from "expo-router";
import { Button, EmptyState, ErrorView, Skeleton } from "@/shared/ui";
import { AdminPage } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";
import { trackDoc } from "@/shared/analytics";
import { docPath } from "@/entities/my-document";
import { useServiceDoc, type DutyKind } from "@/entities/duty-request";
import { CtorPrompt, DutyForm, ExistingCard, FormFrame, PlanCard, SentCard, useDutyRequest, useOpenRequest, useTemplateLawyer } from "@/features/duty-request";

// Duty-advocate request (TZ 14): for a catalogue service, a from-scratch document, an existing one to check — or (`kind` "template") a ready
// template that has no linked service: its document request is sent to the pool through …/lawyer-review (README §11.4).
export default function DutyRequestPage({ kind, serviceId, templateId }: { kind: DutyKind; serviceId?: string; templateId?: string }) {
  const { t } = useT();
  const router = useRouter();
  const byService = kind === "service";
  const byTemplate = kind === "template";
  const svc = useServiceDoc(byService ? serviceId ?? "" : "");
  const tpl = useTemplateLawyer(byTemplate ? templateId ?? "" : "");
  const open = useOpenRequest(byService ? svc.data?.templateId ?? "" : "");
  const { f, att, sub, submit } = useDutyRequest(kind, serviceId, tpl.ctx);
  const out = { onOpen: (id: string) => router.replace(docPath(id) as never), onList: () => router.replace("/documents" as never) };
  const existing = sub.existing ?? (byTemplate ? tpl.blocked : open);

  const view = byService && svc.isLoading ? "load" : byService && svc.isError ? "error" : byService && svc.data && !svc.data.lawyerFlow ? "none"
    : byTemplate && tpl.loading ? "load"
    : sub.result ? "sent" : existing ? "exists" : sub.plan ? "plan" : "form";
  const title = byService ? t("dm7.title") : byTemplate ? t("dcl.title") : kind === "custom" ? t("dm7.titleCustom") : t("dm7.titleReview");

  // README §24: the request form was opened (once per visit; the kind, category and language only).
  const told = useRef(false);
  useEffect(() => {
    if (view !== "form" || told.current) return;
    told.current = true;
    trackDoc("document_lawyer_request_started", { mode: kind, category: tpl.ctx.category || undefined, language: tpl.ctx.language || undefined });
  }, [view, kind, tpl.ctx.category, tpl.ctx.language]);

  const docId = sub.result?.docId ?? "";
  const yes = () => { sub.closePrompt(); router.replace(`/templates/${templateId}/fill?request=${encodeURIComponent(docId)}` as never); };
  const no = () => { sub.closePrompt(); out.onOpen(docId); };
  // The guard also holds while a send is in flight: the button is replaced by its busy state and the request is created at most once.
  const submitDisabled = byTemplate && !tpl.ctx.title;
  return (
    <AdminPage title={title}>
      <FormFrame footer={view === "form" ? <Button title={t("dm7.submit")} icon="send" size="lg" full loading={sub.pending} disabled={submitDisabled} onPress={submit} /> : undefined}>
        {view === "load" ? <Skeleton height={320} round={20} /> : null}
        {view === "error" ? <ErrorView error={svc.error} onRetry={() => void svc.refetch()} /> : null}
        {view === "none" ? <EmptyState icon="slash" title={t("dm9.unavailable")} text={t("dm9.unavailableText")} /> : null}
        {view === "sent" && sub.result ? <SentCard r={sub.result} {...out} /> : null}
        {view === "exists" && existing ? <ExistingCard e={existing} {...out} /> : null}
        {view === "plan" ? <PlanCard message={sub.plan} onChoose={() => router.push("/subscription" as never)} onBack={sub.back} /> : null}
        {view === "form" ? <DutyForm kind={kind} f={f} att={att} busy={sub.pending} sub={byTemplate ? tpl.ctx.title : svc.data?.title} /> : null}
      </FormFrame>
      <CtorPrompt ctor={sub.prompt} onYes={yes} onNo={no} onClose={sub.closePrompt} />
    </AdminPage>
  );
}
