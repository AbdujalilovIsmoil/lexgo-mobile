import { useCallback, useState } from "react";
import { useRouter } from "expo-router";
import { ApiError } from "@/shared/api";
import { useRateTarget, windowOpen, type QualityComplaintRef } from "@/entities/rating";
import { RateForm, useSubmitRating } from "@/features/rating";
import { RateOutcome } from "@/widgets/rating";
import { AdminPage } from "@/shared/ui/admin";
import { PayScroll } from "@/shared/ui/pay/PayScroll";
import { Button, EmptyState, ErrorView, Skeleton, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";

type Sent = { stars: number; complaint: QualityComplaintRef | null };

// Rate a finished work within the backend's rating window; other works may add a complaint here.
export function RatePage({ workId }: { workId: string }) {
  const { t } = useT();
  const q = useRateTarget(workId);
  const router = useRouter();
  const [sent, setSent] = useState<Sent | null>(null);
  const [stars, setStars] = useState(0);
  const submit = useSubmitRating(q.data, (c) => setSent({ stars, complaint: c }));
  const { refetch } = q;
  const expired = useCallback(() => void refetch(), [refetch]);
  const target = q.data;
  const open = !!target && !sent && windowOpen(target.window);
  const missing = q.error instanceof ApiError && q.error.status === 404;
  return (
    <AdminPage title={t("py10.rate.page")} subtitle={target ? target.title || target.workId : workId}>
      <PayScroll keyboard>
        {q.isLoading ? <Skeleton height={260} round={22} /> : missing ? <EmptyState icon="search" title={t("py10.notFound")} /> : q.isError || !target ? <ErrorView error={q.error} onRetry={() => void refetch()} /> : (
          <>
            {target.lawyerName ? <Text variant="small" tone="gray">{t("py10.lawyer", { name: target.lawyerName })}</Text> : null}
            {open ? <RateForm target={target} busy={submit.isPending} onExpired={expired} onSubmit={(n, comment, text) => { setStars(n); submit.mutate({ stars: n, comment, complaint: text }); }} /> : <RateOutcome target={target} sent={sent} />}
            {/* A marketplace order has its own complaint (enterprise §9: one window, and a 1–2 star rating opens it by itself) — no second channel here. */}
            {open && target.kind !== "market" ? <Button title={t("py10.rate.complain")} icon="message-square" variant="line" full onPress={() => router.push({ pathname: "/complaints/new", params: { about: target.workId } })} /> : null}
          </>
        )}
      </PayScroll>
    </AdminPage>
  );
}
