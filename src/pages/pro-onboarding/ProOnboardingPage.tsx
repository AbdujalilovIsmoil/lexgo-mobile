import { useState } from "react";
import { useCabinet, useDocs, useProgress, onboardingState, percentDone } from "@/entities/pro-onboarding";
import { completeness, isAdvocate, sectionsOf, useAccount, useMyProfile } from "@/entities/pro-profile";
import { useSession } from "@/entities/session";
import { DocumentsSheet } from "@/features/pro-onboarding-docs";
import { SubmitFooter } from "@/features/pro-onboarding-submit";
import { OnboardingStatusCard, OnboardingSteps, ProfileSections, SecurityCard } from "@/widgets/pro-onboarding";
import { AdminPage, QueryBoundary } from "@/shared/ui/admin";
import { Notice, PageScroll } from "@/shared/ui/sel";
import { useT } from "@/shared/i18n";

// Seller onboarding (TZ 31): review state, checklist, profile parts, documents, security prompts, submit.
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
  const complete = !!p && p.total > 0 && p.steps.every((s) => s.completed || !s.required);
  const reload = () => void Promise.all([cabinet.refetch(), progress.refetch(), profile.refetch(), account.refetch(), docs.refetch()]);
  // The page works while either the checklist or the cabinet answers; it fails only when both do.
  const gate = { isLoading: progress.isLoading || cabinet.isLoading, isError: progress.isError && cabinet.isError, error: progress.error, refetch: reload };
  return (
    <AdminPage title={t("nav1.menu.onboarding")} footer={state === "approved" ? undefined : <SubmitFooter state={state} complete={complete} />}>
      <QueryBoundary query={gate}>
        <PageScroll onRefresh={reload} refreshing={progress.isRefetching}>
          <OnboardingStatusCard state={state} percent={percentDone(p)} done={p?.completed ?? 0} total={p?.total ?? 0} reason={p?.reason || cabinet.data?.limitedReason || ""} />
          {cabinet.data?.limitedAccess ? <Notice tone="warn" text={t("sl2.limited")} /> : null}
          {p ? <OnboardingSteps steps={p.steps} onDocs={() => setDocsOpen(true)} /> : null}
          {sections.length ? <ProfileSections sections={sections} percent={completeness(sections)} /> : null}
          {user ? <SecurityCard user={user} /> : null}
        </PageScroll>
      </QueryBoundary>
      <DocumentsSheet visible={docsOpen} onClose={() => setDocsOpen(false)} advocate={isAdvocate(profile.data?.sellerType ?? cabinet.data?.sellerType ?? "")} />
    </AdminPage>
  );
}
