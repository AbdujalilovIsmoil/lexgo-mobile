import { useRouter } from "expo-router";
import { asPeriod, PERIOD_KEY, type PlanRequestRow } from "@/entities/plan";
import { StatusPill, RowCard, SectionCard } from "@/shared/ui/admin";
import { fmtUzs } from "@/entities/payment";
import { fmtDateTime } from "@/shared/lib/format";
import { useT } from "@/shared/i18n";

// Tariff requests an operator has not approved yet (pending_manual_document_plan_requests).
export function PendingRequests({ items }: { items: PlanRequestRow[] }) {
  const { t, locale } = useT();
  const router = useRouter();
  if (!items.length) return null;
  return (
    <SectionCard title={t("py3.pending.title")} padded>
      {items.map((r) => (
        <RowCard
          key={r.id}
          icon="send"
          title={r.planTitle || t("py3.pending.fallback")}
          subtitle={`${fmtUzs(r.amount, t)}${r.period ? ` · ${t(PERIOD_KEY[asPeriod(r.period)])}` : ""}`}
          meta={[r.workId, fmtDateTime(r.createdAt, locale)].filter(Boolean).join(" · ")}
          onPress={r.paymentId ? () => router.push(`/payments/${r.paymentId}`) : undefined}
          right={<StatusPill status={r.status} />}
        />
      ))}
    </SectionCard>
  );
}
