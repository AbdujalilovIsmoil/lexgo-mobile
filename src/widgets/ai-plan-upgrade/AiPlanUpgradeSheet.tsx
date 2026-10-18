import { useState } from "react";
import { View } from "react-native";
import { allowedPeriods, FEATURED_SLUG, isAiPlan, PERIOD_KEY, PlanCard, usePlans, type BillingPeriod } from "@/entities/plan";
import { TelegramRequestSheet } from "@/widgets/subscription";
import { FormSheet } from "@/shared/ui/admin";
import { EmptyState, Segmented, Skeleton, Text } from "@/shared/ui";
import { useSheetReset } from "@/shared/lib/useSheetReset";
import { useT } from "@/shared/i18n";

const UPGRADE = /^lexgo-ai-(lite|pro)$/;

// Web "AiPlanUpgradeGate": a free-tier client downloading a template picks the period, then Lite or Pro,
// and confirms with the button below - the same checkout sheet as the tariffs page opens, so buying never leaves the catalogue.
export function AiPlanUpgradeSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { t } = useT();
  const plans = usePlans();
  const [period, setPeriod] = useState<BillingPeriod>("monthly");
  const [id, setId] = useState("");
  const [buy, setBuy] = useState(false);
  useSheetReset(visible, () => { setPeriod("monthly"); setId(""); setBuy(false); });
  const list = (plans.data ?? []).filter((p) => isAiPlan(p) && UPGRADE.test(p.slug) && p.isActive !== false);
  const periods = [...new Set(list.flatMap(allowedPeriods))];
  // The most chosen plan is the default, so one press on the button below is enough; tapping another card changes it.
  const picked = list.find((p) => p.id === id) ?? list.find((p) => p.slug === FEATURED_SLUG) ?? null;
  return (
    <>
      <FormSheet visible={visible && !buy} onClose={onClose} title={t("csv.aiPlanGateTitle")} subtitle={t("csv.aiPlanGateLead")} submitLabel={t("plans.choose")} onSubmit={list.length ? () => setBuy(true) : undefined} disabled={!picked}>
        {plans.isPending ? <Skeleton height={220} round={20} /> : !list.length ? <EmptyState icon="credit-card" title={t("csv.noQualifyingAiPlans")} compact /> : (
          <View style={{ gap: 14 }}>
            <Text variant="small" tone="gray">{t("tgp.mdPeriod")}</Text>
            <Segmented variant="solid" value={period} onChange={setPeriod} options={periods.map((p) => ({ value: p, label: t(PERIOD_KEY[p]) }))} />
            <Text variant="small" tone="gray">{t("tgp.mdPlan")}</Text>
            {list.map((p) => <PlanCard key={p.id} plan={p} period={period} featured={p.slug === FEATURED_SLUG} selected={p.id === picked?.id} onChoose={() => setId(p.id)} />)}
          </View>
        )}
      </FormSheet>
      <TelegramRequestSheet plan={buy ? picked : null} period={period} onClose={() => { setBuy(false); onClose(); }} />
    </>
  );
}
