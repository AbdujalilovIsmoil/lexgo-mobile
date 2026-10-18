import { useRouter } from "expo-router";
import { ApiError } from "@/shared/api";
import { ErrorView, EmptyState } from "@/shared/ui";
import { AdminPage } from "@/shared/ui/admin";
import { ManualDocPlanSheet } from "@/features/manual-doc-plan";
import { useState } from "react";
import { useT } from "@/shared/i18n";

type Props = { title: string; error: unknown; onRetry: () => void };

// Why a document flow cannot start: no template (404), plan needed (402), or a plain error.
export function FlowFailure({ title, error, onRetry }: Props) {
  const { t } = useT();
  const router = useRouter();
  const [plan, setPlan] = useState(true);
  const status = error instanceof ApiError ? error.status : 0;
  return (
    <AdminPage title={title}>
      {status === 404 ? (
        <EmptyState icon="file-minus" title={t("dc6.noTemplate")} text={t("dc6.noTemplateText")} actionLabel={t("common.back")} onAction={() => router.back()} />
      ) : status === 402 ? (
        <EmptyState icon="lock" title={t("dc6.planTitle")} text={t("dc6.planText")} actionLabel={t("dc6.seePlans")} onAction={() => router.push("/subscription")} />
      ) : (
        <ErrorView error={error} onRetry={onRetry} />
      )}
      <ManualDocPlanSheet message={status === 402 && plan ? (error as ApiError).detail ?? "" : null} onClose={() => setPlan(false)} />
    </AdminPage>
  );
}
