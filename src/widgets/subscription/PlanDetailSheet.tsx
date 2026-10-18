import { View } from "react-native";
import { allowedPeriods, PERIOD_KEY, planPerMonth, planTotal, PlanFeatures, PlanFunctions, usePlan, type Plan } from "@/entities/plan";
import { FormSheet, SectionCard, FactRows } from "@/shared/ui/admin";
import { ErrorView, Skeleton, Text } from "@/shared/ui";
import { fmtMoney } from "@/shared/lib/money";
import { useKept } from "@/shared/lib";
import { useT } from "@/shared/i18n";

type Props = { plan: Plan | null; ctaLabel: string; onClose: () => void; onChoose: (p: Plan) => void };

// Everything the backend says about one tariff (GET /subscription-plans/{id}): price per period,
// the feature list, and the functions it switches on with their limits.
export function PlanDetailSheet({ plan, ctaLabel, onClose, onChoose }: Props) {
  const { t } = useT();
  const kept = useKept(plan);
  const q = usePlan(plan?.id ?? null);
  const p = q.data ?? kept;
  return (
    <FormSheet visible={!!plan} onClose={onClose} title={p?.name ?? ""} subtitle={p?.description} submitLabel={ctaLabel} onSubmit={p ? () => onChoose(p) : undefined}>
      {!p ? <Skeleton height={160} round={20} /> : (
        <View style={{ gap: 14 }}>
          <FactRows rows={allowedPeriods(p).map((per) => ({ label: t(PERIOD_KEY[per]), value: `${fmtMoney(planTotal(p, per))} ${t("common.currency")} · ${fmtMoney(planPerMonth(p, per))} ${t("plans.perMonth")}` }))} />
          <SectionCard title={t("plans.features")}><PlanFeatures items={p.features} /></SectionCard>
          {p.functions.length ? <SectionCard title={t("py3.functions")}><PlanFunctions items={p.functions} /></SectionCard> : null}
          {q.isError && !q.data ? <ErrorView error={q.error} compact /> : null}
          {p.autoChargeProvider ? <Text variant="caption" tone="gray2">{t("py3.autoProvider", { p: p.autoChargeProvider.toUpperCase() })}</Text> : null}
        </View>
      )}
    </FormSheet>
  );
}
