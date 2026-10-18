import { ReferralHero, ReferralStats, ReferralSteps } from "@/widgets/profile-extras";
import { useReferral } from "@/entities/profile-extras";
import { AdminPage, QueryBoundary, RowCard } from "@/shared/ui/admin";
import { PayScroll } from "@/shared/ui/pay/PayScroll";
import { Text } from "@/shared/ui";
import { fmtUzs } from "@/entities/payment";
import { fmtDate } from "@/shared/lib/format";
import { tOr } from "@/shared/lib/pay/tOr";
import { useT } from "@/shared/i18n";

// Referral: code + share + QR, progress to the discount, how it works, and who joined.
export function ReferralPage() {
  const { t, locale } = useT();
  const q = useReferral();
  const r = q.data;
  return (
    <AdminPage title={t("py7.ref.page")}>
      <QueryBoundary query={q}>
        <PayScroll refreshing={q.isRefetching} onRefresh={() => void q.refetch()}>
          {r ? <ReferralHero r={r} /> : null}
          {r ? <ReferralStats r={r} /> : null}
          <ReferralSteps />
          <Text variant="h4">{t("py7.ref.invites")}</Text>
          {r && r.items.length ? r.items.map((it, i) => (
            <RowCard key={i} avatar={it.name || it.phone || "?"} title={it.name || it.phone || "—"} subtitle={[it.name ? it.phone : "", tOr(t, "py7.ref.status", it.status), fmtDate(it.joinedAt, locale)].filter(Boolean).join(" · ")} right={it.reward ? <Text variant="small" weight="bold" tone="ok">+{fmtUzs(it.reward, t)}</Text> : undefined} />
          )) : <Text variant="small" tone="gray2">{t("py7.ref.none")}</Text>}
        </PayScroll>
      </QueryBoundary>
    </AdminPage>
  );
}
