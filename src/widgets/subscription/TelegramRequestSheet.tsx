import { useState } from "react";
import { View } from "react-native";
import { allowedPeriods, type BillingPeriod, type Plan } from "@/entities/plan";
import { PeriodTiles, RequestSteps, TelegramNotice, useTelegramRequest } from "@/features/choose-plan";
import { ProfileSheet } from "@/shared/ui/profile";
import { Button, Text } from "@/shared/ui";
import { useKept } from "@/shared/lib";
import { useSheetReset } from "@/shared/lib/useSheetReset";
import { useT } from "@/shared/i18n";
import { RequestPlanCard } from "./RequestPlanCard";
import { RequestSent } from "./RequestSent";

type Props = { plan: Plan | null; period: BillingPeriod; onClose: () => void };

// Choosing a tariff asks an operator to confirm it in Telegram (no payment provider is connected): the plan card and the
// period tiles priced by the backend's quote, the three steps and the note, a sticky Cancel / Send bar, then the receipt
// (SUB-xxxx) with the price breakdown the backend stored.
export function TelegramRequestSheet({ plan, period, onClose }: Props) {
  const { t } = useT();
  const tg = useTelegramRequest();
  const kept = useKept(plan);
  const [per, setPer] = useState(period);
  useSheetReset(!!plan, () => { setPer(period); tg.reset(); });
  const p = plan ?? kept;
  const periods = tg.only ?? (p ? allowedPeriods(p) : []);
  const eff = periods.includes(per) ? per : periods[0];
  const sent = tg.sent;
  return (
    <ProfileSheet visible={!!plan} onClose={onClose} icon="send" accent="sky" title={t("tgp.tgTitle")} subtitle={p?.name} snaps={sent ? [0.52, 0.8] : [0.8, 0.94]}
      onSubmit={sent ? undefined : () => p && tg.send(p.id, eff)} submitLabel={t(tg.pending ? "tgp.tgSending" : "tgp.tgSubmit")} submitting={tg.pending}>
      {!p ? null : sent ? (
        <View style={{ gap: 14 }}>
          <RequestSent workId={sent.workId} pricing={sent.pricing} />
          <TelegramNotice problem={tg.problem} detail={tg.detail} />
          <Button title={t("tgp.tgClose")} variant="gradient" size="lg" full onPress={onClose} />
        </View>
      ) : (
        <View style={{ gap: 16 }}>
          <RequestPlanCard plan={p} period={eff} />
          <View style={{ gap: 8 }}>
            <Text variant="small" tone="gray">{t("tgp.tgPeriod")}</Text>
            <PeriodTiles plan={p} periods={periods} value={eff} onChange={setPer} />
          </View>
          <RequestSteps />
          <Text variant="caption" tone="gray2">{t("tgp.tgLead", { plan: p.name })}</Text>
          <TelegramNotice problem={tg.problem} detail={tg.detail} />
        </View>
      )}
    </ProfileSheet>
  );
}
