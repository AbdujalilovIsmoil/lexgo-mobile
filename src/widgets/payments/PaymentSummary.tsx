import { fmtUzs, groupOf, type PaymentRow } from "@/entities/payment";
import { KpiGrid, KpiTile } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";

// Totals for what the filters show: money actually paid, and payments still waiting.
export function PaymentSummary({ rows }: { rows: PaymentRow[] }) {
  const { t } = useT();
  const paid = rows.filter((p) => groupOf(p.status) === "paid").reduce((n, p) => n + p.amount, 0);
  const waiting = rows.filter((p) => groupOf(p.status) === "pending").length;
  return (
    <KpiGrid>
      <KpiTile label={t("py1.sum.paid")} value={fmtUzs(paid, t)} icon="check-circle" tint="#00A870" />
      <KpiTile label={t("py1.sum.waiting")} value={String(waiting)} icon="clock" tint="#F59E0B" />
    </KpiGrid>
  );
}
