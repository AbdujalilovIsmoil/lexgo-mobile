import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { fmtUzs, PaymentStatusPill, type PaymentRow, type PayPhase } from "@/entities/payment";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { Button, Card, Icon, Skeleton, Text, type IconName } from "@/shared/ui";
import { useOpenPayment } from "../model/useOpenPayment";
import { usePaymentWatch } from "../model/usePaymentWatch";

type Props = { paymentId: string; paymentUrl?: string; workId?: string; onPaid?: (p: PaymentRow) => void };
const ICON: Record<PayPhase, IconName> = { pending_confirmation: "send", awaiting: "clock", paid: "check-circle", failed: "x-circle", cancelled: "x-circle", refunded: "rotate-ccw" };

// Reusable "waiting for the payment" card (TZ 27): shows what the backend says and refreshes
// itself from the user socket. Other packages drop it in after creating a payment.
export function PaymentPendingCard({ paymentId, paymentUrl, workId, onPaid }: Props) {
  const c = useColors();
  const { t } = useT();
  const router = useRouter();
  const w = usePaymentWatch(paymentId, onPaid);
  const open = useOpenPayment(w.refresh);
  const p = w.payment;
  if (!p || !w.phase) return <Skeleton height={120} round={20} />;
  const tint = w.phase === "paid" ? c.okBg : w.phase === "failed" || w.phase === "cancelled" ? c.errBg : w.phase === "refunded" ? c.surface2 : c.warnBg;
  const fg = w.phase === "paid" ? c.ok : w.phase === "failed" || w.phase === "cancelled" ? c.err : w.phase === "refunded" ? c.gray : c.warn;
  return (
    <Card style={s.card}>
      <View style={s.head}>
        <View style={[s.icon, { backgroundColor: tint }]}><Icon name={ICON[w.phase]} size={22} color={fg} /></View>
        <View style={s.col}>
          <Text variant="h4">{t(`py2.pc.${w.phase}.title`)}</Text>
          <Text variant="small" tone="gray">{t(`py2.pc.${w.phase}.text`)}</Text>
        </View>
      </View>
      <View style={s.row}>
        <Text variant="body" weight="bold">{fmtUzs(p.amount, t)}</Text>
        <PaymentStatusPill status={p.status} method={p.method} />
        {workId || p.workId ? <Text variant="caption" tone="gray2">{workId || p.workId}</Text> : null}
      </View>
      <View style={s.row}>
        {w.phase === "awaiting" && paymentUrl ? <Button title={t("py2.pc.openPage")} icon="external-link" size="sm" onPress={() => void open(paymentUrl)} /> : null}
        {w.pending ? <Button title={t("py2.pc.check")} icon="refresh-cw" variant="soft" size="sm" loading={w.refreshing} onPress={w.refresh} /> : null}
        {w.phase === "paid" ? <Button title={t("py2.pc.receipt")} icon="file-text" variant="soft" size="sm" onPress={() => router.push(`/payments/${p.id}`)} /> : null}
      </View>
    </Card>
  );
}

const s = StyleSheet.create({
  card: { gap: 12 },
  head: { flexDirection: "row", gap: 12, alignItems: "center" },
  icon: { width: 46, height: 46, borderRadius: 23, alignItems: "center", justifyContent: "center" },
  col: { flex: 1, gap: 2 },
  row: { flexDirection: "row", alignItems: "center", gap: 10, flexWrap: "wrap" },
});
