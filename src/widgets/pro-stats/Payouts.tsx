import { usePayouts } from "@/entities/pro-workspace";
import { useT } from "@/shared/i18n";
import { fmtDate } from "@/shared/lib/format";
import { fmtMoney } from "@/shared/lib/money";
import { tOr } from "@/shared/lib/pro/tOr";
import { Text } from "@/shared/ui";
import { KpiGrid, KpiTile, RowCard, SectionCard, StatusPill } from "@/shared/ui/admin";

const PAID = ["paid", "released", "completed", "done"];

// Payout ledger (GET /payouts/me): waiting vs paid sums and the latest rows.
export function Payouts() {
  const { t, locale } = useT();
  const q = usePayouts();
  const rows = q.data ?? [];
  const sum = (paid: boolean) => rows.filter((p) => PAID.includes(p.status) === paid).reduce((n, p) => n + p.amount, 0);
  return (
    <SectionCard title={t("aw9.payouts.title")}>
      <KpiGrid>
        <KpiTile loading={q.isLoading} icon="clock" tint="#F59E0B" label={t("aw9.payouts.pending")} value={`${fmtMoney(sum(false))} ${t("adm.currency")}`} />
        <KpiTile loading={q.isLoading} icon="check-circle" tint="#22C55E" label={t("aw9.payouts.paid")} value={`${fmtMoney(sum(true))} ${t("adm.currency")}`} />
      </KpiGrid>
      {rows.length ? rows.slice(0, 8).map((p) => <RowCard key={p.id} icon="credit-card" title={`${fmtMoney(p.amount)} ${t("adm.currency")}`} subtitle={p.period} meta={fmtDate(p.createdAt, locale)} right={<StatusPill status={p.status} label={tOr(t, `admSt.${p.status}`, p.status)} />} />) : !q.isLoading ? <Text variant="small" tone="gray">{t("aw9.payouts.empty")}</Text> : null}
    </SectionCard>
  );
}
