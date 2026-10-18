import { useState } from "react";
import { useCabinet, useDocs, useProgress, nextStep, onboardingState, percentDone, submitReadiness } from "@/entities/pro-onboarding";
import { completeness, isAdvocate, sectionsOf, useAccount, useMyProfile } from "@/entities/pro-profile";
import { useSession } from "@/entities/session";
import { DocumentsSheet } from "@/features/pro-onboarding-docs";
import { SubmitFooter } from "@/features/pro-onboarding-submit";
import { OnboardingSkeleton, OnboardingStatusCard, OnboardingSteps, ProfileSections, SecurityCard } from "@/widgets/pro-onboarding";
import { AdminPage, QueryBoundary } from "@/shared/ui/admin";
import { Notice, PageScroll } from "@/shared/ui/sel";
import { useT } from "@/shared/i18n";

// Seller onboarding (TZ 31), a guided journey: status hero, step timeline, profile parts, security, sticky Submit.
export default function ProOnboardingPage() {
  const { t } = useT();
  const user = useSession()?.user;
  const cabinet = useCabinet();
  const progress = useProgress();
  const profile = useMyProfile();
  const account = useAccount();
  const docs = useDocs();
  const [docsOpen, setDocsOpen] = useState(false);
  const p = progress.data;
  const state = onboardingState(cabinet.data, p);
  const sections = profile.data ? sectionsOf(profile.data, account.data?.name ?? user?.name ?? "", account.data?.email ?? "") : [];
  const ready = submitReadiness(state, p?.steps ?? []);
  const next = p ? nextStep(p.steps) : undefined;
  const stepName = (k: string, fallback: string) => (t(`sl2.steps.${k}`).startsWith("sl2.") ? fallback || k : t(`sl2.steps.${k}`));
  const notes: Record<string, string> = {};
  if (docs.data?.length) notes.documents = t("onbUx.docsCount", { n: docs.data.length });
  if (sections.length) notes.profile = t("onbUx.profilePct", { pct: completeness(sections) });
  const reload = () => void Promise.all([cabinet.refetch(), progress.refetch(), profile.refetch(), account.refetch(), docs.refetch()]);
  // The page works while either the checklist or the cabinet answers; it fails only when both do.
  const gate = { isLoading: progress.isLoading || cabinet.isLoading, isError: progress.isError && cabinet.isError, error: progress.error, refetch: reload };
  return (
    <AdminPage title={t("nav1.menu.onboarding")} footer={ready.mode === "hidden" || gate.isLoading || gate.isError ? undefined : <SubmitFooter state={state} ready={ready} />}>
      <QueryBoundary query={gate} skeleton={<OnboardingSkeleton />}>
        <PageScroll onRefresh={reload} refreshing={progress.isRefetching || cabinet.isRefetching} gap={16}>
          <OnboardingStatusCard state={state} percent={percentDone(p)} done={p?.completed ?? 0} total={p?.total ?? 0} reason={p?.reason || cabinet.data?.limitedReason || ""} nextTitle={next ? stepName(next.key, next.title) : undefined} />
          {cabinet.data?.limitedAccess && state !== "approved" ? <Notice tone="warn" text={t("sl2.limited")} /> : null}
          {p ? <OnboardingSteps steps={p.steps} notes={notes} onDocs={() => setDocsOpen(true)} /> : null}
          {sections.length ? <ProfileSections sections={sections} percent={completeness(sections)} /> : null}
          {user ? <SecurityCard user={user} /> : null}
        </PageScroll>
      </QueryBoundary>
      <DocumentsSheet visible={docsOpen} onClose={() => setDocsOpen(false)} advocate={isAdvocate(profile.data?.sellerType ?? cabinet.data?.sellerType ?? "")} />
    </AdminPage>
  );
}
