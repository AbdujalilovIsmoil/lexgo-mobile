import { Linking, StyleSheet, View } from "react-native";
import { useFinancials, type FlowOrder, type FlowPhase } from "@/entities/market-flow";
import { Button, Icon, Pill, Text } from "@/shared/ui";
import { useColors } from "@/shared/theme";
import { fmtMoney } from "@/shared/lib/money";
import { useT } from "@/shared/i18n";

type Props = { orderId: string; flow: FlowOrder; phase: FlowPhase };

// TZ §6 for the client: the 10% advance asked after the specialist accepted (chat and calls stay closed until it is confirmed), and the 90%
// final payment after completion (final_payment_id / final_amount). Amounts and status are the backend's; payment itself happens through
// the request the backend sends (Telegram / provider link), the screen follows it live.
export function PaymentRequestCard({ orderId, flow, phase }: Props) {
  const c = useColors();
  const { t } = useT();
  const advance = phase === "advance" && !!flow.advance;
  const final = !!flow.finalPayment && (phase === "completed" || phase === "rated");
  const fin = useFinancials(orderId, flow.financialsUrl, (advance || final) && !!flow.financialsUrl);
  if (!advance && !final) return null;
  const kind = advance ? "advance" : "final";
  const row = fin.data?.payments.find((p) => p.kind === kind || (final && !!flow.finalPayment?.id && p.id === flow.finalPayment.id));
  const status = (final ? flow.finalPayment?.status : "") || row?.status || "pending";
  const paid = status === "paid";
  const part = advance ? flow.advance : null;
  const amount = advance ? part?.amount ?? 0 : flow.finalPayment?.amount || flow.final?.amount || 0;
  const pct = advance ? part?.percent : flow.final?.percent;
  // A provider link only when the backend gave one for this very payment (Telegram-approved payments have none).
  const url = final ? flow.finalPayment?.url ?? "" : flow.payment && flow.payment.status !== "paid" ? flow.payment.url : "";
  const title = paid ? t(advance ? "mf.pay.advancePaid" : "mf.pay.finalPaid") : t(advance ? "mf.pay.advanceTitle" : "mf.pay.finalTitle");
  return (
    <View style={[s.box, { backgroundColor: paid ? c.okBg : c.warnBg }]}>
      <View style={s.head}>
        <Icon name={paid ? "check-circle" : "credit-card"} size={20} color={paid ? c.ok : c.warn} />
        <Text variant="body" weight="bold" style={s.flex}>{title}</Text>
        <Pill label={t(`mf.pay.status.${status}`) === `mf.pay.status.${status}` ? status : t(`mf.pay.status.${status}`)} tone={paid ? "ok" : "warn"} small />
      </View>
      <Text variant="small" tone="gray">{pct != null ? t(advance ? "mf.pay.stage.advancePct" : "mf.pay.stage.finalPct", { pct }) : t(advance ? "mf.pay.stage.advance" : "mf.pay.stage.final")}</Text>
      {amount > 0 ? <Text variant="h3" tone="accent">{fmtMoney(amount)} <Text variant="small" tone="gray2">{t("common.currency")}</Text></Text> : null}
      {!paid ? <Text variant="small" tone="gray">{advance ? t("mf.ct.locked") : t("mf.pay.finalText")}</Text> : null}
      {!paid ? (url ? <Button title={t("mf.pay.payNow")} icon="credit-card" variant="gradient" full onPress={() => void Linking.openURL(url)} /> : <Text variant="caption" tone="gray2">{t("mf.pay.viaTelegram")}</Text>) : null}
    </View>
  );
}

const s = StyleSheet.create({
  box: { borderRadius: 20, padding: 16, gap: 8 },
  head: { flexDirection: "row", alignItems: "center", gap: 10 },
  flex: { flex: 1 },
});
