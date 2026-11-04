import { useRef, useState } from "react";
import { View } from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import { allowedPeriods, entitlementKeys, type BillingPeriod, type Plan } from "@/entities/plan";
import { payKeys } from "@/entities/payment";
import { PeriodTiles, TelegramNotice, usePlanCheckout, useTelegramRequest, type CheckoutOutcome } from "@/features/choose-plan";
import { useOpenPayment } from "@/features/payments";
import { ProfileSheet } from "@/shared/ui/profile";
import { Button, Text } from "@/shared/ui";
import { useKept } from "@/shared/lib";
import { useSheetReset } from "@/shared/lib/useSheetReset";
import { useT } from "@/shared/i18n";
import { RequestPlanCard } from "./RequestPlanCard";
import { RequestSent } from "./RequestSent";

type Props = { plan: Plan | null; period: BillingPeriod; onClose: () => void };

// Choosing a tariff opens the payment provider's page (POST /subscription-plans/{id}/purchase, providers tried in order); the app only
// opens it and re-reads on return, the plan turns on when the backend says paid. When no provider is connected, an operator confirms
// the request in Telegram instead (as on the web): the receipt (SUB-xxxx) with the price breakdown the backend stored.
export function TelegramRequestSheet({ plan, period, onClose }: Props) {
  const { t } = useT();
  const tg = useTelegramRequest();
  const qc = useQueryClient();
  const open = useOpenPayment(() => {
    void qc.invalidateQueries({ queryKey: payKeys.list });
    void qc.invalidateQueries({ queryKey: entitlementKeys.all });
  });
  const [invoice, setInvoice] = useState<CheckoutOutcome | null>(null);
  const last = useRef<{ id: string; period: BillingPeriod } | null>(null);
  const checkout = usePlanCheckout((o) => {
    if (o.kind === "unavailable") { if (last.current) tg.send(last.current.id, last.current.period); return; }
    setInvoice(o);
    if (o.paymentUrl) void open(o.paymentUrl);
  });
  const kept = useKept(plan);
  const [per, setPer] = useState(period);
  useSheetReset(!!plan, () => { setPer(period); tg.reset(); checkout.reset(); setInvoice(null); });
  const p = plan ?? kept;
  const periods = tg.only ?? (p ? allowedPeriods(p) : []);
  const eff = periods.includes(per) ? per : periods[0];
  const sent = tg.sent;
  const done = !!sent || !!invoice;
  const submit = () => {
    if (!p || checkout.isPending || tg.pending) return;
    last.current = { id: p.id, period: eff };
    checkout.mutate({ plan: p, period: eff, autoRenew: false });
  };
  return (
    <ProfileSheet visible={!!plan} onClose={onClose} icon="send" accent="sky" title={t("tgp.tgTitle")} subtitle={p?.name} snaps={done ? [0.52, 0.8] : [0.7, 0.9]}
      onSubmit={done ? undefined : submit} submitLabel={t(tg.pending ? "tgp.tgSending" : "tgp.tgSubmit")} submitting={checkout.isPending || tg.pending}>
      {!p ? null : invoice ? (
        <View style={{ gap: 14 }}>
          <RequestSent title={t("tgp.payOpened")} lead={invoice.paymentUrl ? t("tgp.payOpenedLead") : t("tgp.payNoLink")} workId={invoice.workId} pricing={invoice.pricing} />
          {invoice.paymentUrl ? <Button title={t("tgp.payAgain")} icon="credit-card" variant="gradient" size="lg" full onPress={() => void open(invoice.paymentUrl)} /> : null}
          <Button title={t("tgp.tgClose")} variant="soft" size="lg" full onPress={onClose} />
        </View>
      ) : sent ? (
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
          <Text variant="caption" tone="gray2">{t("tgp.tgLead", { plan: p.name })}</Text>
          <TelegramNotice problem={tg.problem} detail={tg.detail} />
        </View>
      )}
    </ProfileSheet>
  );
}
