import { useState } from "react";
import { Linking, StyleSheet, View } from "react-native";
import { createOrderPayment, usePaymentPolicy } from "@/entities/order";
import { isProviderDown, safePaymentUrl } from "@/entities/payment";
import { useColors } from "@/shared/theme";
import { Button, Card, Icon, Skeleton, Text } from "@/shared/ui";
import { fmtMoney } from "@/shared/lib/money";
import { useT } from "@/shared/i18n";

// The advance that unlocks the private chat (GET payment-policy) and the "Pay" button (POST /payments):
// totals, a progress bar, the locked / unlocked line, then the provider page. Once enough is paid the
// button becomes "Open private chat".
export function PayBlock({ orderId, onChat }: { orderId: string; onChat?: () => void }) {
  const { t } = useT();
  const c = useColors();
  const { data: pol, isPending, refetch } = usePaymentPolicy(orderId);
  const [paying, setPaying] = useState(false);
  const [note, setNote] = useState("");
  const som = (n: number) => `${fmtMoney(n)} ${t("common.currency")}`;
  const pay = async () => {
    if (!pol || paying) return;
    setPaying(true);
    setNote("");
    try {
      const due = pol.contactUnlocked ? pol.price - pol.paidAmount : pol.remainingToUnlock || pol.advanceAmount;
      const r = await createOrderPayment(orderId, due);
      const url = r.paymentUrl && safePaymentUrl(r.paymentUrl);
      if (url) { setNote(t("ord.payOpened")); await Linking.openURL(url); void refetch(); } else setNote(t("ord.payUnavailable"));
    } catch (e) {
      setNote(isProviderDown(e) ? t("ord.payUnavailable") : t("csv.payError"));
    } finally {
      setPaying(false);
    }
  };
  if (isPending) return <Skeleton height={150} round={20} />;
  if (!pol) return <Text variant="small" tone="err">{t("csv.payError")}</Text>;
  const pct = pol.price ? Math.min(100, Math.round((pol.paidAmount / pol.price) * 100)) : 0;
  const row = (k: string, v: string, bold?: boolean) => <View style={s.row}><Text variant="small" tone="gray">{k}</Text><Text variant="small" weight={bold ? "bold" : "medium"}>{v}</Text></View>;
  return (
    <View style={s.col}>
      <Card tinted style={s.col}>
        {row(t("csv.payTotal"), som(pol.price), true)}
        {row(t("csv.payAdvance", { pct: pol.advancePercent || 10 }), som(pol.advanceAmount))}
        {row(t("csv.payPaid"), som(pol.paidAmount))}
        <View style={[s.bar, { backgroundColor: c.line }]}><View style={[s.fill, { width: `${pct}%`, backgroundColor: c.accent }]} /></View>
        <View style={s.row}>
          <Icon name={pol.contactUnlocked ? "check-circle" : "lock"} size={16} color={pol.contactUnlocked ? c.ok : c.warn} />
          <Text variant="caption" tone={pol.contactUnlocked ? "ok" : "warn"} style={s.flex}>{pol.contactUnlocked ? t("csv.payUnlocked") : t("csv.payLocked", { amount: som(pol.remainingToUnlock) })}</Text>
        </View>
      </Card>
      {note ? <Text variant="small" tone="warn" center>{note}</Text> : null}
      {pol.contactUnlocked ? (
        onChat ? <Button title={t("csv.payOpenChat")} icon="message-circle" onPress={onChat} variant="gradient" full /> : null
      ) : <Button title={paying ? t("ord.paying") : t("csv.payAdvanceBtn", { pct: pol.advancePercent || 10 })} onPress={() => void pay()} loading={paying} variant="gradient" icon="credit-card" full />}
    </View>
  );
}

const s = StyleSheet.create({
  col: { gap: 12 },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  flex: { flex: 1 },
  bar: { height: 6, borderRadius: 3, overflow: "hidden" },
  fill: { height: 6 },
});
