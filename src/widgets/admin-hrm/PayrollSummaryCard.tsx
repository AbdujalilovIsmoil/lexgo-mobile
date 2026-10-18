import { PAY_COLOR, PAY_GROUPS, payGroup, usePayrollSummary, type PayGroup } from "@/entities/admin-hrm";
import { QueryBoundary } from "@/shared/ui/admin";
import { CcHero } from "@/shared/ui/cc";
import { fmtCompact, fmtMoney } from "@/shared/lib/money";
import { useT } from "@/shared/i18n";

// GET /internal/payroll/summary for the chosen month: total + entry count, and the split bonus / penalty / advance / salary as one bar.
export function PayrollSummaryCard({ period }: { period: string }) {
  const { t } = useT();
  const q = usePayrollSummary(period);
  const s = q.data;
  const sum: Record<PayGroup, number> = { salary: 0, bonus: 0, advance: 0, penalty: 0 };
  Object.entries(s?.byType ?? {}).forEach(([k, v]) => { sum[payGroup(k)] += Math.abs(v); });
  const segments = PAY_GROUPS.map((g) => ({ key: g, value: sum[g], color: PAY_COLOR[g], label: `${t(`admHrmQ.${g}`)} ${fmtCompact(sum[g])}` }));
  return (
    <QueryBoundary query={q}>
      <CcHero
        stats={[{ value: `${fmtMoney(s?.total ?? 0)} ${t("adm.currency")}`, label: `${t("admHrmC.payTotal")}${s?.period ? ` · ${s.period}` : ""}`, color: "#22C55E" }, { value: String(s?.count ?? 0), label: t("admHrmC.payCount") }]}
        segments={segments}
      />
    </QueryBoundary>
  );
}
