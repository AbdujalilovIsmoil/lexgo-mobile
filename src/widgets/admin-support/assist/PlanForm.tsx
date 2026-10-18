import { View } from "react-native";
import { Button, Skeleton, Text } from "@/shared/ui";
import { FactRows, SelectField } from "@/shared/ui/admin";
import { isPeriod } from "@/entities/admin-support";
import { useT } from "@/shared/i18n";
import type { usePlanFlow } from "./usePlanFlow";

type Flow = ReturnType<typeof usePlanFlow>;

// Plan and period pickers, the list price and the quote that is shown to the client.
export function PlanForm({ f }: { f: Flow }) {
  const { t } = useT();
  const { fresh } = f;
  if (f.plans.isLoading) return <Skeleton height={120} round={16} />;
  if (f.plans.isError) return <Button title={t("common.retry")} variant="soft" onPress={() => void f.plans.refetch()} />;
  if (!f.plan) return <Text variant="small" tone="gray">{t("admSupC.plan.none")}</Text>;
  return (
    <View style={{ gap: 14 }}>
      <Text variant="small" tone="gray">{t("admSupC.plan.lead")}</Text>
      <SelectField label={t("admSupC.plan.plan")} value={f.plan.id} options={f.list.map((p) => ({ value: p.id, label: p.name, hint: f.sum(p.monthly) }))} onChange={(planId) => f.setSel((s) => ({ ...s, planId }))} />
      <SelectField label={t("admSupC.plan.period")} value={f.period} options={f.periods.map((p) => ({ value: p, label: t(`admSupC.period.${p}`) }))} onChange={(v) => isPeriod(v) && f.setSel((s) => ({ ...s, period: v }))} />
      <Text variant="caption" tone="gray2">{t("admSupC.plan.listPrice", { amount: f.listPrice })}</Text>
      <Button title={f.previewing ? t("admSupC.plan.previewing") : t("admSupC.plan.preview")} variant="line" icon="eye" onPress={f.runPreview} loading={f.previewing} />
      {fresh ? (
        <FactRows rows={[
          { label: t("admSupC.plan.period"), value: fresh.months > 0 ? t("admSupC.months", { n: fresh.months }) : t(`admSupC.period.${f.period}`) },
          ...(fresh.discountAmount > 0 ? [{ label: t("admSupC.plan.base"), value: f.sum(fresh.subtotal || fresh.baseAmount, fresh.currency) }, { label: t("admSupC.plan.discount"), value: `−${f.sum(fresh.discountAmount, fresh.currency)}${fresh.discountPercent ? ` (${fresh.discountPercent}%)` : ""}` }] : []),
          { label: t("admSupC.plan.total"), value: f.sum(fresh.amount, fresh.currency) },
        ]} />
      ) : f.stale ? <Text variant="small" tone="warn">{t("admSupC.plan.stale")}</Text> : null}
      {f.err ? <Text variant="small" tone="err">{f.err}</Text> : null}
    </View>
  );
}
