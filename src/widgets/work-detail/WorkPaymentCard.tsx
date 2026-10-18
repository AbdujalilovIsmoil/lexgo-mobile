import { StyleSheet, View } from "react-native";
import { useWorkText, type WorkPayment } from "@/entities/work";
import { useWorkNav } from "@/features/work-actions";
import { useT } from "@/shared/i18n";
import { fmtMoney } from "@/shared/lib/money";
import { Button, Pill, Text, type PillTone } from "@/shared/ui";
import { SectionCard } from "@/shared/ui/admin";

const TONE: Record<string, PillTone> = { paid: "ok", unpaid: "warn", pending: "warn", processing: "warn", failed: "err", cancelled: "gray", canceled: "gray", refunded: "gray" };

// Price and payment state exactly as the server reports them. The app never marks a
// payment paid: the status changes here when the server confirms it.
export function WorkPaymentCard({ payment }: { payment: WorkPayment }) {
  const { t } = useT();
  const nav = useWorkNav();
  const text = useWorkText();
  const free = payment.amount <= 0;
  return (
    <SectionCard title={t("cl5.pay.title")}>
      <View style={s.row}>
        <Text variant="h3">{free ? t("cl5.pay.free") : `${fmtMoney(payment.amount)} ${t("common.currency")}`}</Text>
        {payment.status ? <Pill label={text.status(payment.status)} tone={TONE[payment.status] ?? "gray"} /> : null}
      </View>
      {payment.required && !payment.paid ? (
        <>
          <Text variant="small" tone="gray">{t("cl5.pay.waiting")}</Text>
          <Button title={t("cl5.pay.open")} icon="credit-card" variant="soft" size="sm" onPress={nav.payments} />
        </>
      ) : null}
    </SectionCard>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
});
