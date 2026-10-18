import { useRouter } from "expo-router";
import { Button, EmptyState, ErrorView, Skeleton } from "@/shared/ui";
import { AdminPage } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";
import { docPath } from "@/entities/my-document";
import { useServiceDoc, type DutyKind } from "@/entities/duty-request";
import { DutyForm, ExistingCard, FormFrame, PlanCard, SentCard, useDutyRequest, useOpenRequest } from "@/features/duty-request";

// Duty-advocate request (TZ 14): for a catalogue service, a from-scratch document or an existing one to check.
export default function DutyRequestPage({ kind, serviceId }: { kind: DutyKind; serviceId?: string }) {
  const { t } = useT();
  const router = useRouter();
  const byService = kind === "service";
  const svc = useServiceDoc(byService ? serviceId ?? "" : "");
  const open = useOpenRequest(svc.data?.templateId ?? "");
  const { f, att, sub, submit } = useDutyRequest(kind, serviceId);
  const out = { onOpen: (id: string) => router.replace(docPath(id) as never), onList: () => router.replace("/documents" as never) };
  const existing = sub.existing ?? open;

  const view = byService && svc.isLoading ? "load" : byService && svc.isError ? "error" : byService && svc.data && !svc.data.lawyerFlow ? "none"
    : sub.result ? "sent" : existing ? "exists" : sub.plan ? "plan" : "form";
  const title = byService ? t("dm7.title") : kind === "custom" ? t("dm7.titleCustom") : t("dm7.titleReview");
  return (
    <AdminPage title={title}>
      <FormFrame footer={view === "form" ? <Button title={t("dm7.submit")} icon="send" size="lg" full loading={sub.pending} onPress={submit} /> : undefined}>
        {view === "load" ? <Skeleton height={320} round={20} /> : null}
        {view === "error" ? <ErrorView error={svc.error} onRetry={() => void svc.refetch()} /> : null}
        {view === "none" ? <EmptyState icon="slash" title={t("dm9.unavailable")} text={t("dm9.unavailableText")} /> : null}
        {view === "sent" && sub.result ? <SentCard r={sub.result} {...out} /> : null}
        {view === "exists" && existing ? <ExistingCard e={existing} {...out} /> : null}
        {view === "plan" ? <PlanCard message={sub.plan} onChoose={() => router.push("/subscription" as never)} onBack={sub.back} /> : null}
        {view === "form" ? <DutyForm kind={kind} f={f} att={att} busy={sub.pending} sub={svc.data?.title} /> : null}
      </FormFrame>
    </AdminPage>
  );
}
